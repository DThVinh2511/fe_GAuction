import stompApi from './stomp';
import httpApi from './axios';
import { KeepAlive } from 'vue';

const config = {
    onJoinableAuction: null,
}

let auctionJoinRegistry = {};

stompApi.setOnDisconnect(() => {
    for (const session in auctionJoinRegistry) {
        session.leave();
    }
    auctionJoinRegistry = {};
})

/**
 * @typedef {Object} AuctionSession
 * @property {Function} isOpen - Check if the session is open
 * @property {Function} bid - Place a bid
 * @property {Function} comment - Place
 * @property {Function} leave - Leave the auction room
 * @property {Function?} onStart - Callback for when the auction starts
 * @property {Function?} onEnd - Callback for when the auction ends
 * @property {Function?} onNotification - Callback for notifications
 * @property {Function?} onBid - Callback for bid updates
 * @property {Function?} onComment - Callback for comment updates
 */

/**
 * @param {string | number} auctionId
 * @param {Object} callbacks 
 * @param {Function?} callbacks.onStart
 * @param {Function?} callbacks.onEnd
 * @param {Function?} callbacks.onNotification
 * @param {Function?} callbacks.onBid
 * @param {Function?} callbacks.onComment
 * @returns {Promise<AuctionSession>}
 */
async function joinAuctionRoom(auctionId, callbacks) {
    try {
        const response = (await httpApi.post(`/v1/auctions/${auctionId}/join`)).data.data;
        console.log(response);
        const wasActive = response['started'];

        const session = {
            onStart: callbacks.onStart,
            onEnd: callbacks.onEnd,
            onNotification: callbacks.onNotification,
            onBid: callbacks.onBid,
            onComment: callbacks.onComment
        };
        let sessionActive = wasActive;
        Object.defineProperties(session, {
            auctionId: {
                value: auctionId,
                writable: false
            },
            isJoined: {
                get: () => auctionJoinRegistry[auctionId] === session
            },
            isActive: {
                get: () => session.isJoined ? sessionActive : undefined
            },
            leave: {
                value: async function () {
                    if (this.isJoined) {
                        await leaveAuctionRoom(auctionId);
                    }
                },
                writable: false
            }
        });
        

        const controlPromise = stompApi.subscribe(`/topic/auction/${auctionId}/control`, 
            (message) => {
                const body = JSON.parse(message.body);
                const type = body.type;
                if (type === "start") {
                    if (!wasActive) {
                        subscribeBid(auctionId, session);
                        subscribeComment(auctionId, session);
                    }
                    sessionActive = true;
                    session.onStart?.(body.data);
                }
                if (type === "end") {
                    sessionActive = false;
                    if (session.isJoined) {
                        session.leave();
                    }
                    session.onEnd?.(body.data);
                }
            });

        const notificationPromise = stompApi.subscribe(`/topic/auction/${auctionId}/notifications`, 
            (message) => {
                const { body } = message;
                session.onNotification?.(JSON.parse(body));
            }); 

        const bidPromise = wasActive ? subscribeBid(auctionId, session) : null;
        const commentPromise = wasActive ? subscribeComment(auctionId, session) : null;
        
        await Promise.all([controlPromise, notificationPromise, bidPromise, commentPromise]);
  
        auctionJoinRegistry[auctionId] = session;
        return session;
    } catch (error) {
        throw error;
    }
}
      
async function leaveAuctionRoom(auctionId) {
    stompApi.unsubscribe(`/topic/auction/${auctionId}/bids`);
    stompApi.unsubscribe(`/topic/auction/${auctionId}/comments`);
    stompApi.unsubscribe(`/topic/auction/${auctionId}/notifications`);
    stompApi.unsubscribe(`/topic/auction/${auctionId}/control`);
    delete auctionJoinRegistry[auctionId];
    console.log('leaving auction room');
    await httpApi.post(`/v1/auctions/${auctionId}/leave`, {}, { keepAlive: true });
}

async function bid(auctionId, amount) {
    return stompApi.send(`/app/auction/${auctionId}/bid`, amount);
}

async function comment(auctionId, content) {
    return stompApi.send(`/app/auction/${auctionId}/comment`, content);
}

async function getCurrentPrice(auctionId) {
    console.log('getting current price');
    return stompApi.send(`/app/auction/${auctionId}/last-price`);
}

async function getPastComments(auctionId, from) {
    const fromParam = from ? `?from=${from.toISOString()}` : '';
    return (await httpApi.get(`/v1/auctions/${auctionId}/comments${fromParam}`)).data.data;
}

async function getBidsInAuctionProgess(auctionId) {
    return (await httpApi.get(`/v1/auctions/${auctionId}/bids`)).data.data;
}

const auctionSessionApi = {
    config,
    joinAuctionRoom,
    leaveAuctionRoom,
    bid,
    comment,
    getCurrentPrice,
    getPastComments,
    getBidsInAuctionProgess
}

export default auctionSessionApi;

function subscribeBid(auctionId, callbacks) {
    return stompApi.subscribe(`/topic/auction/${auctionId}/bids`, (message) => {
        const body = JSON.parse(message.body);
        body['createdAt'] = formatTimeFromArray(body['createdAt']);
        // Chuyển đổi createdAt thành định dạng ISO
        // const createdAt = new Date(body?.createdAt?.replace(" ", "T"));

        // // Định dạng lại thời gian thành HH:mm:ss
        // const formattedTime = format(createdAt, 'HH:mm:ss');
        // body.createdAt = formattedTime;
        callbacks.onBid?.(body);
    });
}

function subscribeComment(auctionId, callbacks) {
    return stompApi.subscribe(`/topic/auction/${auctionId}/comments`, (message) => {
        const body = JSON.parse(message.body);
        // body['createdAt'] = parseDateTimeArray(body['createdAt']);
        callbacks.onComment?.(body);
    });
}

// function parseDateTimeArray(dateArray) {
//     const [year, month, day, hour, minute, second] = dateArray;
//     return new Date(year, month - 1, day, hour, minute, second);
// }

stompApi.onControlMessage('joinable', (message) => {
    config.onJoinableAuction?.(message);
})

function formatTimeFromArray(dateArray) {
    // Kiểm tra xem dateArray có phải là mảng và có đủ 7 phần tử không
    if (Array.isArray(dateArray) && dateArray.length === 7) {
        const [year, month, day, hours, minutes, seconds] = dateArray;

        // Tạo đối tượng Date từ mảng (tháng trong JS bắt đầu từ 0)
        const date = new Date(year, month - 1, day, hours, minutes, seconds);

        // Lấy giờ, phút, giây
        const formattedHours = String(date.getHours()).padStart(2, '0');
        const formattedMinutes = String(date.getMinutes()).padStart(2, '0');
        const formattedSeconds = String(date.getSeconds()).padStart(2, '0');

        // Tạo chuỗi định dạng HH:mm:ss
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        throw new Error('Input is not a valid date array');
    }
}

