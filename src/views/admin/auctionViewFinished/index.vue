<template>
  <div v-if="auction" class="absolute left-0 top-24 container p-1 h-5/6 max-w-full">
    <div class="flex flex-col md:flex-row h-full">
      <div class="w-full md:w-1/3 bg-black flex items-center justify-center mb-4 md:mb-0">
        <div class="relative w-full h-full flex items-center justify-center">
          <img v-for="(image, index) in images" :key="index" :src="image.src" alt="Session"
            v-show="index === currentImageIndex" class="max-w-full max-h-full object-contain" />
          <button @click="prevImage"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full">
            <img src="../../../assets/icon/prev-arrow-slide.svg" alt="Previous" class="w-6 h-6" />
          </button>
          <button @click="nextImage"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full">
            <img src="../../../assets/icon/next-arrow-slide.svg" alt="Next" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="relative w-full md:w-1/3 bg-white p-4 flex flex-col mb-4 md:mb-0">
        <button @click="goBack" class="absolute -top-16 right-5 text-gray-500 hover:text-gray-700 mt-20">
          <img src="../../../assets/icon/cancel.svg" alt="Close" class="w-6 h-6" />
        </button>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ auction.title }}</h1>
        <div class="border-b-2 border-gray-300 mb-4"></div>
        <div class="mb-4">
          <h2 v-if="sessionState === 'PENDING'" class="text-md font-semibold text-blue-600 mb-2">Auction starts in:
            {{ timeUntilStart }}</h2>
          <h2 v-else-if="sessionState === 'IN_PROGRESS'" class="text-md font-semibold text-green-600 mb-2">Time
            remaining: {{ timeLeft }}</h2>
          <h2 v-else-if="sessionState === 'FINISHED'" class="text-md font-semibold text-red-600 mb-2">Auction has
            ended</h2>
        </div>
        <div class="border-b-2 border-gray-300 mb-4"></div>
        <div class="mb-4">
          <h2 class="text-xl font-semibold text-gray-700 mb-6">Session Details</h2>
          <p class="text-gray-700 mb-2"><strong>Starting Price:</strong> {{ formattedStartingBid }}</p>
          <p class="text-gray-700 mb-2"><strong>Stepping Price:</strong> {{ formattedSteppingPrice }}</p>
          <p class="text-gray-700 mb-2"><strong>Start Time:</strong> {{ auction.startTime ?? '?' }}</p>
          <p class="text-gray-700 mb-2"><strong>End Time:</strong> {{ auction.endTime ?? '?' }}</p>
          <p v-if="sessionState === 'FINISHED'" class="text-gray-700 mb-2"><strong>End Bid:</strong> {{ auction.endBid?.toLocaleString('vi-VN') ?? '?' }}</p>
          <p class="text-gray-700 mb-2"><strong>User created:</strong> {{ owner?.fullName ?? '?' }}</p>
          <p v-if="sessionState === 'FINISHED'" class="text-gray-700 mb-2"><strong>User Victory:</strong> {{ buyer?.fullName ?? '?' }}</p>
        </div>
      </div>


      <div class="h-full w-px bg-gray-300 ml-4"></div>

      <!-- list user auction -->
      <div class="w-full md:w-1/3 bg-white p-4 flex flex-col relative">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Latest auction updates</h2>
        <div class="border-b-2 border-gray-300 mb-4"></div>
        <div class="flex flex-col h-full overflow-y-hidden p-2 justify-end">
          <div class="overflow-y-scroll custom-scrollbar scroll-smooth" ref="bidsContainer" @scroll="handleScroll">
            <div
              v-for="(bid, index) in bids"
              :key="index"
              hoverable
              class="h-10 text-sm w-full flex justify-start items-center shadow-md rounded-lg mb-2 p-2"
            >
              <a-card-meta class="w-full">
                <template #title>
                  <div class="flex justify-between w-full">
                    <div>{{ bid?.userName + ' bid ' + bid?.bid.toLocaleString('vi-VN') + ' VND' }}</div>
                    <div class="text-gray-500 text-xs">{{ bid?.createdAt }}</div>
                  </div>
                </template>
              </a-card-meta>
            </div>
          </div>
          <button v-if="showScrollDown" @click="scrollToBottom"
            class="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white p-2 rounded-full shadow-lg z-50">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" class="x19dipnz x1lliihq x1tzjh5l" style="--color: var(--mwp-primary-theme-color);"><g fill-rule="evenodd" transform="translate(-90 -248)"><path fill-rule="nonzero" d="M95.322 258.928a.75.75 0 0 0-1.06 1.06l5.208 5.209a.75.75 0 0 0 1.06 0l5.209-5.208a.75.75 0 0 0-1.06-1.06L100 263.605l-4.678-4.678z"></path><path fill-rule="nonzero" d="M99.25 251.333v12.813a.75.75 0 1 0 1.5 0v-12.813a.75.75 0 1 0-1.5 0z"></path></g></svg>
          </button>
        </div>
      </div>
      <button @click="toggleComments"
        class="fixed top-20 right-2 flex justify-center items-center bg-white p-2 rounded-full border-collapse outline outline-green-400 shadow-lg z-50 h-14 w-14">
        <img v-if="!showComments" src="../../../assets/icon/comment.svg" alt="Toggle" class="w-6 h-6" />
        <img v-else src="../../../assets/icon/hide-comment.svg" alt="Toggle" class="w-6 h-6" />
      </button>
      <div v-if="showComments"
        class="z-40 fixed top-24 right-2 w-96 min-h-[300px] bg-white pt-0 pb-0 pr-4 pl-4 shadow-lg rounded-lg transition-transform transform border-collapse outline outline-slate-400"
        :class="{ 'translate-x-0': showComments, 'translate-x-full': !showComments }">
        <div class="p-3 sticky top-0 bg-white z-10">
          <h2 class="text-xl font-semibold text-gray-700 mb-0">Comments</h2>
        </div>
        <div ref="commentsContainer">
          <a-list item-layout="horizontal" :data-source="comments"
          class="mt-5 overflow-y-scroll custom-scrollbar min-h-[200px] max-h-[450px] list-comment scroll-smooth" @scroll="handleScrollChat">
            <template #renderItem="{ item }">
              <a-list-item :key="item.id">
                <a-list-item-meta :description="formatContent(item.content)">
                  <template #title>
                    <a class="font-bold">{{ item.name }}</a>
                    <div class="flex justify-between w-full">
                      <div class="font-bold">{{ item?.userName }}</div>
                      <div class="text-gray-500 text-xs">{{ item?.createdAt }}</div>
                    </div>
                  </template>
                  <template #avatar>
                    <a-avatar :src="UserIcon" class="user-icon" />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <button v-if="showScrollDownChat" @click="scrollToBottomChat"
            class="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white p-2 rounded-full shadow-lg z-50">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" class="x19dipnz x1lliihq x1tzjh5l" style="--color: var(--mwp-primary-theme-color);"><g fill-rule="evenodd" transform="translate(-90 -248)"><path fill-rule="nonzero" d="M95.322 258.928a.75.75 0 0 0-1.06 1.06l5.208 5.209a.75.75 0 0 0 1.06 0l5.209-5.208a.75.75 0 0 0-1.06-1.06L100 263.605l-4.678-4.678z"></path><path fill-rule="nonzero" d="M99.25 251.333v12.813a.75.75 0 1 0 1.5 0v-12.813a.75.75 0 1 0-1.5 0z"></path></g></svg>
          </button>
        </div>
      </div>
      <button @click="toggleNotify"
        class="fixed top-40 right-2 flex justify-center items-center bg-white p-2 rounded-full border-collapse outline outline-green-400 shadow-lg z-30 h-14 w-14">
        <img v-if="!showNotify" src="../../../assets/icon/notification-bell.svg" alt="Toggle" class="w-6 h-6" />
        <img v-else src="../../../assets/icon/notification-bell.svg" alt="Toggle" class="w-6 h-6" />
      </button>
      <div v-if="showNotify"
        class="z-20 fixed top-44 right-2 w-96 min-h-[300px] bg-white pt-0 pb-0 pr-4 pl-4 shadow-lg rounded-lg transition-transform transform border-collapse outline outline-slate-400"
        :class="{ 'translate-x-0': showNotify, 'translate-x-full': !showNotify }">
        <div class="p-3 sticky top-0 bg-white z-10">
          <h2 class="text-xl font-semibold text-gray-700 mb-0">Notifycations</h2>
        </div>
        <div class="p-2 overflow-y-scroll custom-scrollbar scroll-smooth min-h-[200px] max-h-[450px]" ref="NotifiesContainer" @scroll="handleScrollNotify">
          <a-card v-for="(noti, index) in notifications" :key="index"
            class="bg-white shadow-lg rounded-lg mb-2">
            <a-card-meta>
              <template #description class="color-none">
                <div class="color-none">
                  <b>ADMIN thông báo: </b>
                  <span>{{ noti?.content }}</span>
                </div>
                <div class="text-gray-500 text-xs">{{ noti?.createdAt }}</div>
              </template>
              <template #avatar>
                <a-avatar :src="UserIcon" class="user-icon" />
              </template>
            </a-card-meta>
          </a-card>
        </div>
        <button v-if="showScrollDownNotify" @click="scrollToBottomNotify"
          class="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white p-2 rounded-full shadow-lg z-50">
          <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" class="x19dipnz x1lliihq x1tzjh5l" style="--color: var(--mwp-primary-theme-color);"><g fill-rule="evenodd" transform="translate(-90 -248)"><path fill-rule="nonzero" d="M95.322 258.928a.75.75 0 0 0-1.06 1.06l5.208 5.209a.75.75 0 0 0 1.06 0l5.209-5.208a.75.75 0 0 0-1.06-1.06L100 263.605l-4.678-4.678z"></path><path fill-rule="nonzero" d="M99.25 251.333v12.813a.75.75 0 1 0 1.5 0v-12.813a.75.75 0 1 0-1.5 0z"></path></g></svg>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect, defineProps, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { differenceInMilliseconds, differenceInSeconds, formatDistance, parse, parseISO } from 'date-fns';
import { useStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';
import UserIcon from "../../../assets/icon/user.svg";
import auctionApi from '../../../api/auctions';
import authApi from '../../../api/auths';
import adminApi from '../../../api/admin';

const IMAGE_PREFIX = import.meta.env.VITE_IMAGE_PREFIX;

const store = useStore();

const route = useRoute();
const router = useRouter();

// const props = defineProps({
//     auctionId: {
//         type: Number,
//         required: true,
//     }
// });

// const { auctionId } = props;

const auctionId = route.params.id;
const userId = jwtDecode(localStorage.getItem('token')).id;
console.log(userId);

const auctionInfoRef = ref(null);
const auction = computed(() => auctionInfoRef.value || {});
const product = computed(() => auction.value.product || {});
const owner = ref(null);  // Use a ref to store owner data
const buyer = ref(null);
console.log(product);

watch(product, async () => {
  if (product.value.buyerId) {
    const [user1, user2] = await Promise.all([
      authApi.getAnotherInfo(product.value.buyerId),
      authApi.getAnotherInfo(product.value.ownerId)
    ]);
    owner.value = user2;  // Fetch the owner info when product changes
    buyer.value = user1;
  }
}, { immediate: true });

const goBack = () => {
  router.back();
};

const images = computed(() => {
  const raw = product.value?.image?.split(", ");
  console.log(raw);
  const img = raw?.map((src) => ({
    src: IMAGE_PREFIX + src
  })) || [];
  console.log(img);
  return img;
});

const currentImageIndex = ref(0);

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = images.value.length - 1;
  }
};

function nextImage() {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

const baseDate = new Date();
let diffseconds = 0;
const now = ref(baseDate);
const timeUntilStart = computed(() => {
  if (!auction.value.startTime) {
    return null;
  }
  const startTime = parse(auction.value.startTime, 'yyyy-MM-dd HH:mm:ss', new Date());
  return formatTimeLeft(now.value, startTime);
})

const timeLeft = computed(() => {
  if (!auction.value.endTime) {
    return null;
  }
  const endTime = parse(auction.value.endTime, 'yyyy-MM-dd HH:mm:ss', new Date());
  return formatTimeLeft(now.value, endTime);
})

function updateCountdown() {
  const theNow = new Date();
  const diff = Math.floor(differenceInSeconds(theNow, baseDate));
  if (diff > diffseconds) {
    diffseconds = diff;
    now.value = theNow;
  }
};

let countdownInterval = null;

function formatTimeLeft(from, to) {
    let inSeconds = differenceInSeconds(to, from);
    const negative = inSeconds < 0;
    inSeconds = Math.abs(inSeconds);
    const hours = Math.floor(inSeconds / 3600);
    const minutes = Math.floor(inSeconds / 60) % 60;
    const seconds = inSeconds % 60;
    if (negative) return '00:00:00';
    return `${negative ? '-' : ''}${formatUnit(hours)}:${formatUnit(minutes)}:${formatUnit(seconds)}`;

  function formatUnit(unit) {
    return unit.toString().padStart(2, '0');
  }
}

const sessionState = ref(null);
const startingPrice = computed(() => auction.value.startBid?.toLocaleString('vi-VN'));
const steppingPrice = computed(() => auction.value.pricePerStep?.toLocaleString('vi-VN'));
const currentPrice = ref(null);
const isCurrentPriceYours = ref(false);
const yourPriceInput = ref('0');

const formattedSteppingPrice = computed(() => {
  return formatPrice(steppingPrice.value);
});

const formattedStartingBid = computed(() => {
  return formatPrice(startingPrice.value);
});

const formattedCurrentPrice = computed(() => {
  return formatPrice(currentPrice.value);
});
// const formattedYourPrice = computed(() => {
//     return formatPrice(yourPrice.value);
// });

const minimumPrice = computed(() => {
  return Math.max(startingPrice.value,
    currentPrice.value ? currentPrice.value + steppingPrice.value : 0);
});

const biddable = computed(() => {
  const yourPrice = parsePrice(yourPriceInput.value);
  return sessionState.value === "IN_PROGRESS" && yourPrice >= minimumPrice.value;
});

// function adjustYourPrice(event) {
//     const cleaned = event.target.value.replace(/\D/g, '');
//     const newPrice = parsePrice(cleaned);
//     const oldCursorPos = event.target.selectionStart;
//     const digitsToTheRight = event.target.value.substring(oldCursorPos).match(/\d/g)?.length || 0;

//   const formatted = formatPrice(newPrice);
//   let newCursorPos = formatted.length;
//   let dgcount = 0;
//   while (dgcount < digitsToTheRight && newCursorPos > 0) {
//     if (formatted[newCursorPos - 1].match(/\d/)) {
//       dgcount++;
//     }
//     newCursorPos--;
//   }
//   if (dgcount < digitsToTheRight) {
//     newCursorPos = formatted.length;
//   }
//   yourPriceInput.value = formatted;
//   setTimeout(() => {
//     event.target.setSelectionRange(newCursorPos, newCursorPos);
//   }, 0);
// };

// function increasePrice() {
//   if (!auctionInfoRef.value) {
//     return;
//   }
//   const yourPrice = parsePrice(yourPriceInput.value);
//   const addedPrice = yourPrice + steppingPrice.value;

//   const editedPrice = Math.max(minimumPrice.value, addedPrice);
//   yourPriceInput.value = formatPrice(editedPrice);
// }

// function decreasePrice() {
//   if (!auctionInfoRef.value) {
//     return;
//   }
//   const yourPrice = parsePrice(yourPriceInput.value);
//   const decreasedPrice = yourPrice - steppingPrice.value;

//   const editedPrice = Math.max(minimumPrice.value, decreasedPrice);
//   yourPriceInput.value = formatPrice(editedPrice);
// }

// function handlePlaceBid() {
//   if (!biddable.value) {
//     return;
//   }
//   const newPrice = parsePrice(yourPriceInput.value);
//   sessionApi.bid(auction.value.id, newPrice).catch((err) => {
//     message.error(err.message);
//   });
// };

function parsePrice(priceStr) {
  return (parseInt(priceStr.replace(/\./g, '')) || 0);
};

function formatPrice(priceNum) {
  return priceNum == null ? "" :
    `${priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};



const bids = ref([]);

const comments = ref([]);
const notifications = ref([]);

const formatContent = (content) => {
  return content.replace(/"/g, '');
}

const showScrollDown = ref(false);
const showScrollDownChat = ref(false);
const showScrollDownNotify = ref(false);
const bidsContainer = ref(null);
const NotifiesContainer = ref(null);
const commentsContainer = ref(null);

function scrollToBottom() {
  nextTick(() => {
    const container = bidsContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

function scrollToBottomNotify() {
  nextTick(() => {
    const container = NotifiesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

const showComments = ref(false);
const showNotify = ref(false);

function toggleComments() {
  showComments.value = !showComments.value;
  showNotify.value = false;
  scrollToBottomChat();
}
function toggleNotify() {
  showNotify.value = !showNotify.value;
  showComments.value = false;
  scrollToBottomNotify();
}

function scrollToBottomChat() {
  nextTick(() => {
    const container = commentsContainer.value;
    if (container) {
      const aListElement = container.querySelector('.list-comment');
      aListElement.scrollTop = aListElement.scrollHeight;
    }
  });
}

function handleScroll() {
  const container = bidsContainer.value;
  if (container.scrollTop + container.clientHeight < (container.scrollHeight-10)) {
    showScrollDown.value = true; // Show scroll down button
  } else {
    showScrollDown.value = false; // Hide scroll down button
  }
}

function handleScrollNotify() {
  const container = NotifiesContainer.value;
  if (container.scrollTop + container.clientHeight < (container.scrollHeight-10)) {
    showScrollDownNotify.value = true; // Show scroll down button
  } else {
    showScrollDownNotify.value = false; // Hide scroll down button
  }
}

function handleScrollChat() {
  const container = commentsContainer.value.querySelector('.list-comment');
  if (container.scrollTop + container.clientHeight < (container.scrollHeight-10)) {
    showScrollDownChat.value = true; // Show scroll down button
  } else {
    showScrollDownChat.value = false; // Hide scroll down button
  }
}
onMounted(() => {
  auctionApi.getAuctionById(auctionId)
    .then((res) => {
      auctionInfoRef.value = res;
      sessionState.value = 
          ["IN_PROGRESS", "FINISHED", "CANCELLED"].includes(res.status) ? res.status : "PENDING";
      if(sessionState.value === "FINISHED") {
        adminApi.getBidAuction(res.id, res.status).then((res) => {
          bids.value = res;
        });
        adminApi.getCommentAuction(res.id).then((comment) => {
          comments.value = comment;
        });
        adminApi.getNotifycationInAuction(res.id).then((noti) => {
          notifications.value = noti;
        })
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
watch(bids, () => {
  scrollToBottom();
});
watch(comments, () => {
  scrollToBottomChat();
});
watch(notifications, () => {
  scrollToBottomNotify();
});
onUnmounted(() => {
});

</script>

<style lang="scss" src="./style.scss" scoped />
