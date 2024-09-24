<template>
  <div class="flex flex-col md:flex-row mt-20 mx-5 space-y-5 md:space-y-0 md:space-x-5">
    <div class="w-full md:w-1/5 mr-4">
      <MenuSessionManagement />
    </div>
    <div class="relative md:w-4/5 container border-l bg-white mx-auto p-10 rounded-md shadow-lg mt-6">
      <div class="w-full max-w-md mx-auto">
        <h1 class="text-2xl font-bold text-center text-gray-800">Add Auction Session</h1>
        <div class="border-b-2 border-white mt-2 mb-8"></div>
      </div>
      <button @click="goToProduct"
        class="absolute right-4 top-4 flex items-center space-x-2 -ml-16 mb-4 text-gray-600 hover:text-gray-900">
        <img src="../../../../assets/icon/auth-back.svg" alt="Back" class="w-6 h-6" />
        <span>Back to Product</span>
      </button>
      <form @submit.prevent="submitAuction" class="lg:flex justify-center ">
        <div v-if="product.id === ''" class="w-full lg:w-1/3">
          <p class="text-red-500 mb-4">Please select product before creating auction!!</p>
          <button @click="goToProduct" class="bg-slate-400 text-white px-4 py-2 rounded hover:bg-slate-500">Select
            product now
          </button>
        </div>
        <div v-if="product.id !== ''" class="w-full mb-10 lg:w-1/3">
          <h1 class="text-xl font-bold text-gray-800 mb-4">Product Information</h1>
          <div class="flex mb-1 ">
            <label for="productId" class="block text-gray-700 text-lg font-semibold mr-2">Product
              ID:</label>
            <p id="productId" class="text-gray-800 text-lg font-thin "> {{ product.id }}</p>
          </div>
          <div class="flex mb-1">
            <label for="category" class="block text-gray-700 text-lg font-semibold mr-2">Product
              Name:</label>
            <p id="category" class="text-gray-800">{{ product.name }}</p>
          </div>
          <div class="flex mb-1">
            <label for="category" class="block text-gray-700 text-lg font-semibold mr-2">Category:</label>
            <p id="category" class="text-gray-800">{{ product.category }}</p>
          </div>
          <div class="flex mb-1">
            <label for="productDescription" class="block text-gray-700 text-lg font-semibold mr-2">Description:</label>
            <p id="productDescription" class="text-gray-800">{{ product.description }}</p>
          </div>
        </div>

        <div class="w-full lg:w-2/3">
          <div class="mb-5">
            <label for="title" class="block text-gray-700 mb-3 font-semibold">Title</label>
            <input type="text" id="title" v-model="auction.title"
              class="form-input w-full border border-gray-300 rounded-md px-2 py-2" />
          </div>

          <div class="mb-5">
            <label for="description" class="block text-gray-700 mb-3 font-semibold">Description</label>
            <textarea id="description" v-model="auction.description"
              class="form-textarea w-full border border-gray-300 rounded-md px-2 py-2"></textarea>
          </div>

          <div class="mb-5">
            <label for="startBid" class="block text-gray-700 mb-3 font-semibold">Start Bid</label>
            <input id="startBid" v-model="startBid" type="text" @input="formatedStartBid"
              class="form-input w-full border border-gray-300 rounded-md px-2 py-2" />
          </div>

          <div class="mb-5">
            <label for="pricePerStep" class="block text-gray-700 mb-3 font-semibold">Price per Step</label>
            <input id="pricePerStep" v-model="pricePerStep" type="text" @input="formatedPricePerStep"
              class="form-input w-full border border-gray-300 rounded-md px-2 py-2" />
          </div>

          <div v-if="loading" class="flex items-center justify-center">
            <a-spin size="large" />
          </div>
          <button type="submit"
            class="w-full bg-teal-400 hover:bg-teal-500 outline-gray-400 shadow-lg text-white font-bold py-2 px-4 rounded">
            Confirm
          </button>
        </div>
      </form>
    </div>
  </div>

</template>

<script setup>
import MenuSessionManagement from '../../../../components/MenuSessionManagement/index.vue';
import { ref } from 'vue';
import { useStore } from 'vuex'
import auctionApi from '../../../../api/auctions.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const startBid = ref('0');
const pricePerStep = ref('0');

const product = store.getters.getProductDetail;

const loading = ref(false);
const auction = ref({
  title: '',
  description: '',
  start_bid: '',
  price_per_step: '',
  product_id: ''
});

const goToProduct = () => {
  router.push("/user/allProduct");
}

const submitAuction = async () => {
  loading.value = true;
  try {
    auction.value.product_id = product.id;
    auction.value.start_bid = parsePrice(startBid.value);
    auction.value.price_per_step = parsePrice(pricePerStep.value);
    const response = await auctionApi.addAuction(auction.value);
    store.commit('setProductDetail', '');
  } catch (error) {
    console.log(error);
  }
  finally {
    loading.value = false;
    resetForm();
  }
};

const resetForm = () => {
  auction.value = {
    title: '',
    description: '',
    startBid: '',
    pricePerStep: '',
    product: {
      name: '',
      category: '',
      image: ''
    }
  };
};
function formatedStartBid(event) {
  const cleaned = event.target.value.replace(/\D/g, '');
  const newPrice = parsePrice(cleaned);
  const oldCursorPos = event.target.selectionStart;
  const digitsToTheRight = event.target.value.substring(oldCursorPos).match(/\d/g)?.length || 0;

  const formatted = formatPrice(newPrice);
  let newCursorPos = formatted.length;
  let dgcount = 0;
  while (dgcount < digitsToTheRight && newCursorPos > 0) {
    if (formatted[newCursorPos - 1].match(/\d/)) {
      dgcount++;
    }
    newCursorPos--;
  }
  if (dgcount < digitsToTheRight) {
    newCursorPos = formatted.length;
  }
  startBid.value = formatted;
  setTimeout(() => {
    event.target.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};
function formatedPricePerStep(event) {
  const cleaned = event.target.value.replace(/\D/g, '');
  const newPrice = parsePrice(cleaned);
  const oldCursorPos = event.target.selectionStart;
  const digitsToTheRight = event.target.value.substring(oldCursorPos).match(/\d/g)?.length || 0;

  const formatted = formatPrice(newPrice);
  let newCursorPos = formatted.length;
  let dgcount = 0;
  while (dgcount < digitsToTheRight && newCursorPos > 0) {
    if (formatted[newCursorPos - 1].match(/\d/)) {
      dgcount++;
    }
    newCursorPos--;
  }
  if (dgcount < digitsToTheRight) {
    newCursorPos = formatted.length;
  }
  pricePerStep.value = formatted;
  setTimeout(() => {
    event.target.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};

function parsePrice(priceStr) {
  return (parseInt(priceStr.replace(/\./g, '')) || 0);
};

function formatPrice(priceNum) {
  return priceNum == null ? "" :
    `${priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

</script>
