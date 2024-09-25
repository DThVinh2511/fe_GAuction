<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="closeModal">
    <div
      class="modal-content relative bg-white p-6 rounded-lg w-5/6 max-w-screen-lg mx-4 mt-28 h-[80vh] overflow-y-auto">
      <button @click="closeModal" class="absolute top-4 right-4">
        <img src="../../../../assets/icon/cancel.svg" alt="Close" class="w-6 h-6" />
      </button>
      <div class="lg:flex w-full">
        <div class="lg:w-1/2 p-2 relative">
          <div class="w-full p-2">
            <img src="../../../../assets/images/product.jpg" alt="Session Image" class="modal-image mb-4" />
          </div>
          <div class="w-full overflow-hidden rounded-md p-2 relative">
            <div class="">
              <!-- <img v-for="(image, index) in arrayImage" :key="index" :src='image' alt="Image"
                v-show="index === currentImageIndex" class="h-max w-max center" /> -->
                <div class="flex justify-center items-center w-full bg-gray-100 p-1">
                  <img v-for="(image, index) in arrayImage" :key="index" :src="image" alt="Image"
                      v-show="index === currentImageIndex" 
                      class="object-fill h-200 w-300 rounded-[10px]" />
                </div>
              <button @click="prevImage"
                class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full">
                <img src="../../../../assets/icon/prev-arrow-slide.svg" alt="Previous" class="w-6 h-6" />
              </button>
              <button @click="nextImage"
                class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full">
                <img src="../../../../assets/icon/next-arrow-slide.svg" alt="Next" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        <div class="lg:w-1/2 p-4 border-l border-gray-300">
          <h2 class="text-2xl font-bold mb-4">{{ session.title }}</h2>
          <p class="text-gray-700 mb-2"><strong>Product ID:</strong> {{ session.product.id }}</p>
          <p class="text-gray-700 mb-2"><strong>Product Name:</strong> {{ session.product.name }}</p>
          <p class="text-gray-700 mb-2"><strong>Category:</strong> {{ session.product.category }}</p>
          <p class="text-gray-700 mb-2"><strong>Description:</strong> {{ session.description }}</p>
          <p class="text-gray-700 mb-2"><strong>Start Bid:</strong> {{ session.start_bid }}</p>
          <p class="text-gray-700 mb-2"><strong>Price per Step:</strong> {{ session.price_per_step }}</p>
          <p class="text-gray-700 mb-2"><strong>Start Time:</strong> {{ session.start_time }}</p>
          <p class="text-gray-700 mb-2"><strong>End Time:</strong> {{ session.end_time }}</p>
          <p class="text-gray-700 mb-2" v-if="session.end_bid"><strong>End Bid:</strong> {{ session.end_bid }}</p>
          <p class="text-gray-700 mb-2" v-if="session.buyer && session.buyer.fullName"><strong>Buyer:</strong> {{ session.buyer.fullName }}</p>
          <p class="text-gray-700 mb-2" v-if="session.owner && session.owner.fullName"><strong>Owner:</strong> {{ session.owner.fullName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  session: Object,
});

const arrayImage = ref([]);

const updateArrayImage = () => {
  if (props?.session?.product) {
    arrayImage.value = props?.session?.product.image.split(', ').map(img => `${import.meta.env.VITE_IMAGE_PREFIX}` + img.trim());
    console.log(arrayImage.value)
  }
}

watch(() => props?.session?.product, updateArrayImage, { immediate: true });

const currentImageIndex = ref(0);

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = arrayImage.value.length - 1;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < arrayImage.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};


const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style lang="scss" src="./style.scss" scoped />
