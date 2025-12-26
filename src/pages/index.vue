<template>
  <div class="common-layout">
    <!-- 直接调用三个组件，顺序：头部 → 搜索 → 天气展示 -->
    <Fheader />
    <div class="content-container">
      <!-- Fmain搜索组件：接收它的搜索结果 -->
      <Fmain @searchResult="getSearchResult" />
      <!-- F1展示组件：把搜索结果传给它 -->
      <F1 :weatherData="searchResultData" />
    </div>
  </div>
</template>

<script setup>
// 只引入需要的三个组件，不用其他多余内容
import Fheader from '../layouts/components/Fheader.vue';
import Fmain from '../layouts/components/Fmain.vue';
import F1 from '../layouts/components/F1.vue';
import { ref } from 'vue';

// 存储Fmain传过来的搜索结果，默认是空数组
const searchResultData = ref([]);

// 接收Fmain的搜索结果，赋值给searchResultData（再传给F1）
const getSearchResult = (result) => {
  searchResultData.value = result;
};
</script>

<style scoped>
/* 简单样式，保证页面不混乱 */
.common-layout {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
}

.content-container {
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>