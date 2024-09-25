<template>
  <div class="flex flex-col md:flex-row mt-20 mx-5 space-y-5 md:space-y-0 md:space-x-5">
    <div class="w-full md:w-1/5 mr-4">
      <MenuAuctionHistory />
    </div>
    <div class="relative w-full md:w-4/5 container border-l bg-white mx-auto p-10 rounded-md shadow-lg mt-6">
      <div class="w-full max-w-md mx-auto">
        <h1 class="text-2xl font-bold text-center text-gray-800">
          Auctions you won
        </h1>
        <div class="border-b-2 border-zinc-400 mt-2 mb-8"></div>
      </div>

      <div v-if="loading" class="flex items-center justify-center">
        <a-spin size="large" />
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="(session, index) in paginatedSessions" :key="index" :product="session" :index="index"
          class="bg-white shadow-lg rounded-lg cursor-pointer transform hover:scale-105 transition duration-300 ease-in-out"
          @click="openModal(session)">

          <a-card hoverable @click="selectSession(session, index)">
            <template #cover>
              <img src="../../../../assets/images/auction.jpg" alt="Session" />
            </template>
            <a-card-meta :title="session.title" :description="session.status">
              <template #avatar>
                <a-avatar :src="session.avatar" />
              </template>
            </a-card-meta>
          </a-card>
        </div>
      </div>
      <button @click="prevSlide"
        class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-slate-300 bg-opacity-50 p-2 rounded-full">
        <img src="../../../../assets/icon/prev-arrow-slide.svg" alt="Previous" class="w-6 h-6" />
      </button>
      <button @click="nextSlide"
        class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-slate-300 bg-opacity-50 p-2 rounded-full">
        <img src="../../../../assets/icon/next-arrow-slide.svg" alt="Next" class="w-6 h-6" />
      </button>
      <div class="flex justify-center mt-4">
        <a-pagination
          v-model="currentPage" 
          :page-size="pageSizeRef"
          :total="totalSessions" 
          show-size-changer
          :page-size-options="['8', '12', '16', '20']"
          @change="handlePageChange"
        />
      </div>
      <SessionModal :isVisible="isModalVisible" :session="selectedSession" @close="closeModal" />
    </div>
  </div>
</template>

<script setup>
import auctionApi from '../../../../api/auctions';
import authApi from '../../../../api/auths';
import productApi from '../../../../api/products';
import MenuAuctionHistory from '../../../../components/MenuAuctionHistory/index.vue';
import SessionModal from '../historyAuctionDetail/index.vue';
import { ref, computed, reactive, onBeforeMount, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const loading = ref(true);
const isModalVisible = ref(false);
const selectedSession = ref(null);
const sessions = ref([]);
// sessions = store.getters.getSessions;
//sessions.push(...store.state.sessions);

const selectSession = async (session, index) => {
  try {
    const product = await productApi.getProductById(session.product_id);
    if(product.buyerId) {
      const [buyer, owner] = await Promise.all([
        authApi.getAnotherInfo(product.buyerId),
        authApi.getAnotherInfo(product.ownerId)
      ]); 
      selectedSession.value = {
        ...session,
        product: {...product},
        owner: {...owner},
        buyer: {...buyer}
      } 
    } else {
      const owner = await authApi.getAnotherInfo(product.ownerId);
      selectedSession.value = {
        ...session,
        product: {...product},
        owner: {...owner}
      }
    } 
  } catch (error) {
    message.error('Fetch failed');
  }
}


const currentPage = ref(1);
const pageSize = 4;
const pageSizeRef = ref(8);
let totalSessions = 20;

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize * 2;
  const end = start + pageSize * 2;
  return sessions.value.slice(start, end);
});

const prevSlide = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextSlide = () => {
  if (currentPage.value < Math.ceil(totalSessions / (pageSize * 2))) {
    currentPage.value++;
  }
};

const openModal = (session) => {
  selectedSession.value = session;
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

watch(sessions, () => {
  totalSessions = 20;
});

const handlePageChange = async (page,pageSize) => {
  currentPage.value = page;
  pageSizeRef.value=pageSize;
  const pageCurrent = page - 1;
  await renderProduct(pageCurrent,pageSize);
};

const renderProduct = async (pageCurrent,pageSize) => {
  loading.value = true;
  if(!pageSize) pageSize=8;
  try {
    const res = await auctionApi.getAllAuctionMyWon(pageCurrent,pageSize);
    sessions.value = res.content;
    // console.log(products);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onBeforeMount(async () => renderProduct(0));

</script>

<style lang="scss" src="./style.scss" scoped />
