<template>
  <div class="search-wrapper">
    <!-- 搜索框 -->
    <div class="search-input-container">
      <el-input
        v-model="searchQuery"
        placeholder="输入城市名查询天气"
        @keyup.enter="handleSearch"
        @focus="showHistory = true"
        class="search-input"
        ref="inputRef"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </template>
      </el-input>
    </div>

    <!-- 搜索历史 -->
    <div 
      v-if="showHistory && searchHistory.length" 
      class="history-container"
      @click.stop
    >
      <div class="history-header">
        <span>搜索历史</span>
        <span 
          v-if="searchHistory.length" 
          class="clear-btn" 
          @click="clearHistory"
        >
          清空
        </span>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="useHistory(item)"
        >
          <span>{{ item }}</span>
          <el-icon @click.stop="removeHistory(index)">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

const router = useRouter();

// 响应式数据
const searchQuery = ref('');
const searchHistory = ref([]);
const showHistory = ref(false);
const inputRef = ref(null);

// 模拟城市数据
const allMockCities = ref([
  { name: '北京', condition: '晴', temperature: '23', feelsLike: '22', aqi: '良' },
  { name: '上海', condition: '多云', temperature: '25', feelsLike: '26', aqi: '优' },
  { name: '广州', condition: '雨', temperature: '28', feelsLike: '30', aqi: '良' },
  { name: '深圳', condition: '阴', temperature: '27', feelsLike: '28', aqi: '优' },
  { name: '杭州', condition: '多云', temperature: '24', feelsLike: '25', aqi: '优' },
  { name: '南京', condition: '晴', temperature: '22', feelsLike: '21', aqi: '良' },
  { name: '成都', condition: '雾', temperature: '18', feelsLike: '19', aqi: '轻度污染' },
  { name: '长沙', condition: '晴', temperature: '10', feelsLike: '8', aqi: '良' },
  { name: '黑龙江', condition: '雨', temperature: '-6', feelsLike: '4', aqi: '优' },
  { name: '乌鲁木齐', condition: '晴', temperature: '-10', feelsLike: '2', aqi: '一般' },
  { name: '威海', condition: '雪', temperature: '-5', feelsLike: '5', aqi: '良' }
]);

// 生命周期
onMounted(() => {
  const savedHistory = localStorage.getItem('weatherSearchHistory');
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory);
  }
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 点击外部关闭历史
const handleClickOutside = (event) => {
  const searchComponent = document.querySelector('.search-wrapper');
  if (searchComponent && !searchComponent.contains(event.target)) {
    showHistory.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  const query = searchQuery.value.trim();
  if (!query) {
    ElMessage.warning('请输入城市名');
    return;
  }

  const targetCity = allMockCities.value.find(city => 
    city.name === query
  );

  if (targetCity) {
    // 保存搜索历史
    saveSearchHistory(query);
    
    // 跳转到详情页
    router.push({
      path: '/weather-detail',
      query: {
        city: targetCity.name,
        condition: targetCity.condition,
        temperature: targetCity.temperature,
        feelsLike: targetCity.feelsLike,
        aqi: targetCity.aqi
      }
    });
    
    searchQuery.value = '';
    showHistory.value = false;
  } else {
    ElMessage.error(`未找到 "${query}" 相关城市`);
  }
};

// 使用历史记录
const useHistory = (item) => {
  const targetCity = allMockCities.value.find(city => 
    city.name === item
  );
  if (targetCity) {
    router.push({
      path: '/weather-detail',
      query: {
        city: targetCity.name,
        condition: targetCity.condition,
        temperature: targetCity.temperature,
        feelsLike: targetCity.feelsLike,
        aqi: targetCity.aqi
      }
    });
  }
  searchQuery.value = '';
  showHistory.value = false;
};

// 历史记录管理
const saveSearchHistory = (query) => {
  const existingIndex = searchHistory.value.indexOf(query);
  if (existingIndex !== -1) {
    searchHistory.value.splice(existingIndex, 1);
  }
  searchHistory.value.unshift(query);
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10);
  }
  localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory.value));
};

const removeHistory = (index) => {
  searchHistory.value.splice(index, 1);
  localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory.value));
  event.stopPropagation();
};

const clearHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('weatherSearchHistory');
  ElMessage.success('搜索历史已清空');
  event.stopPropagation();
};
</script>

<style scoped>
.search-wrapper {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
  max-width: 500px;
}

.search-input-container {
  position: relative;
  z-index: 1002;
}

.search-input {
  width: 100%;
}

.history-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1001;
  background: white;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.history-header span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.history-header .clear-btn {
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
  transition: all 0.2s;
}

.history-header .clear-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.history-list {
  padding: 8px 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item span {
  font-size: 14px;
  color: #606266;
}

.history-item .el-icon {
  font-size: 14px;
  color: #c0c4cc;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}

.history-item .el-icon:hover {
  color: #f56c6c;
  background-color: #fef0f0;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .search-wrapper {
    padding: 0 16px;
  }
}
</style>