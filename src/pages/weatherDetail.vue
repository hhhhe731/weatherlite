<template>
  <div class="weather-detail-page">
    <!-- 顶部控制栏 -->
    <div class="top-controls">
      <el-button type="text" :icon="ArrowLeft" @click="goBack" class="back-btn">
        返回
      </el-button>
      
      <div class="page-header">
        <h1 class="page-title">天气详情</h1>
        <div class="header-actions">
          <!-- 收藏按钮 -->
          <el-button 
            type="text" 
            :icon="isCityCollected ? StarFilled : Star" 
            @click="toggleCollect"
            class="collect-btn"
            :class="{ collected: isCityCollected }"
          >
            {{ isCityCollected ? '已收藏' : '收藏' }}
          </el-button>
          <el-select v-model="temperatureUnit" class="unit-select" size="small">
            <el-option label="°C 摄氏度" value="celsius" />
            <el-option label="°F 华氏度" value="fahrenheit" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="main-container" v-if="cityData">
      <!-- 城市基本信息 -->
      <div class="city-section">
        <div class="city-header">
          <div class="city-info">
            <h2 class="city-name">{{ cityData.city }}</h2>
            <div class="collect-badge" v-if="isCityCollected">
              <el-icon><StarFilled /></el-icon>
              <span>已收藏</span>
            </div>
          </div>
          <div class="update-info">
            <el-icon><Clock /></el-icon>
            更新时间: {{ updateTime }}
          </div>
        </div>
      </div>

      <!-- 主要天气信息 -->
      <div class="weather-main-grid">
        <!-- 左侧：温度和天气状况 -->
        <div class="weather-primary">
          <div class="current-temperature">
            <div class="temp-number">{{ formatTemperature(cityData.temperature) }}</div>
            <div class="temp-unit">°{{ temperatureUnit === 'celsius' ? 'C' : 'F' }}</div>
          </div>
          
          <div class="weather-condition">
            <el-icon class="condition-icon" :class="getIconClass(cityData.condition)" size="40">
              <component :is="getWeatherIcon(cityData.condition)" />
            </el-icon>
            <span class="condition-text">{{ cityData.condition }}</span>
          </div>
        </div>

        <!-- 中间：详细数据 -->
        <div class="weather-details">
          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-label">体感温度</div>
              <div class="detail-value">{{ formatTemperature(cityData.feelsLike || cityData.temperature) }}°</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">空气质量</div>
              <div class="detail-value">{{ cityData.aqi || '良' }}</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-label">湿度</div>
              <div class="detail-value">{{ cityData.humidity || '65%' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">风速</div>
              <div class="detail-value">{{ cityData.windSpeed || '3级' }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧：温度范围 -->
        <div class="temp-range">
          <div class="temp-range-item high">
            <div class="range-label">最高温度</div>
            <div class="range-value">{{ formatTemperature(parseInt(cityData.temperature) + 3) }}°</div>
          </div>
          <div class="temp-range-item low">
            <div class="range-label">最低温度</div>
            <div class="range-value">{{ formatTemperature(parseInt(cityData.temperature) - 3) }}°</div>
          </div>
        </div>
      </div>

      <!-- 天气建议 -->
      <div class="suggestion-section">
        <div class="section-header">
          <el-icon><InfoFilled /></el-icon>
          <h3>出行建议</h3>
        </div>
        <div class="suggestion-content">
          {{ getSuggestion(cityData.condition) }}
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="!cityData" class="loading-state">
      <div class="loading-content">
        <el-icon class="loading-icon" size="40"><Loading /></el-icon>
        <div class="loading-text">正在加载天气数据...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft,
  Sunny, 
  Cloudy, 
  Umbrella,
  Loading,
  InfoFilled,
  Clock,
  Star,
  StarFilled
} from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElSelect, ElOption, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const cityData = ref(null)
const updateTime = ref('')
const temperatureUnit = ref('celsius')
const collectedCities = ref([]) // 存储收藏的城市列表

// 计算当前城市是否已被收藏
const isCityCollected = computed(() => {
  return cityData.value ? collectedCities.value.includes(cityData.value.city) : false
})

onMounted(() => {
  // 从localStorage加载收藏的城市列表
  const saved = localStorage.getItem('weatherCollectedCities')
  if (saved) {
    collectedCities.value = JSON.parse(saved)
  }
  
  if (route.query.city) {
    cityData.value = {
      city: route.query.city,
      condition: route.query.condition,
      temperature: route.query.temperature,
      humidity: route.query.humidity,
      windSpeed: route.query.windSpeed,
      feelsLike: route.query.feelsLike,
      aqi: route.query.aqi
    }
    
    updateTime.value = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else {
    setTimeout(() => {
      router.back()
    }, 1500)
  }
})

// 收藏/取消收藏功能
const toggleCollect = () => {
  if (!cityData.value) return
  
  const cityName = cityData.value.city
  const index = collectedCities.value.indexOf(cityName)
  
  if (index !== -1) {
    // 如果已收藏，则取消收藏
    collectedCities.value.splice(index, 1)
    ElMessage.info(`已取消收藏 ${cityName}`)
  } else {
    // 如果未收藏，则添加到收藏
    collectedCities.value.push(cityName)
    ElMessage.success(`已收藏 ${cityName}`)
  }
  
  // 保存到localStorage，与F1.vue共享收藏数据
  localStorage.setItem('weatherCollectedCities', JSON.stringify(collectedCities.value))
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 温度格式化
const formatTemperature = (temp) => {
  const celsius = parseInt(temp)
  if (temperatureUnit.value === 'fahrenheit') {
    return Math.round(celsius * 9/5 + 32)
  }
  return celsius
}

// 天气图标
const getWeatherIcon = (condition) => {
  const iconMap = {
    '晴': Sunny,
    '多云': Cloudy,
    '阴': Cloudy,
    '雨': Umbrella,
    '大雨': Umbrella,
    '雷雨': Umbrella,
    '雾': Cloudy
  }
  return iconMap[condition] || Cloudy
}

// 图标样式类
const getIconClass = (condition) => {
  const classMap = {
    '晴': 'sunny',
    '多云': 'cloudy',
    '阴': 'cloudy',
    '雨': 'rain',
    '大雨': 'rain',
    '雷雨': 'rain',
    '雾': 'cloudy'
  }
  return classMap[condition] || 'cloudy'
}

// 天气建议
const getSuggestion = (condition) => {
  const suggestions = {
    '晴': '天气晴朗，适合户外活动，建议穿着轻便衣物，注意防晒。',
    '多云': '天气以多云为主，适宜外出，可携带雨具以防万一。',
    '阴': '天气阴沉，温度适宜，请注意增减衣物。',
    '雨': '今天有降雨，出门请带伞，注意道路湿滑。',
    '大雨': '有大雨天气，请尽量减少外出，注意安全。',
    '雷雨': '有雷雨天气，请避免户外活动，注意防雷。',
    '雾': '有雾，能见度较低，出行请注意交通安全。'
  }
  return suggestions[condition] || '天气状况良好，适宜外出。'
}
</script>

<style scoped>
.weather-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部控制 */
.top-controls {
  margin-bottom: 20px;
}

.back-btn {
  margin-bottom: 15px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #dcdfe6;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 收藏按钮 */
.collect-btn {
  transition: all 0.3s;
}

.collect-btn.collected {
  color: #faad14;
}

.collect-btn:hover {
  color: #faad14;
}

/* 主容器 */
.main-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

/* 城市信息 */
.city-section {
  margin-bottom: 20px;
}

.city-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.city-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.city-name {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.collect-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #fff7e6;
  border: 1px solid #faad14;
  border-radius: 12px;
  font-size: 12px;
  color: #faad14;
}

.collect-badge .el-icon {
  font-size: 12px;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

/* 主要天气网格 */
.weather-main-grid {
  flex: 1;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 左侧主要天气 */
.weather-primary {
  flex: 1;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.current-temperature {
  display: flex;
  align-items: baseline;
  margin-bottom: 30px;
}

.temp-number {
  font-size: 72px;
  font-weight: 700;
  color: #f56c6c;
  line-height: 1;
}

.temp-unit {
  font-size: 28px;
  color: #909399;
  margin-left: 8px;
}

.weather-condition {
  display: flex;
  align-items: center;
  gap: 15px;
}

.condition-icon {
  font-size: 40px;
}

.condition-icon.sunny {
  color: #e6a23c;
}

.condition-icon.cloudy {
  color: #909399;
}

.condition-icon.rain {
  color: #409eff;
}

.condition-text {
  font-size: 22px;
  font-weight: 500;
}

/* 中间详细数据 */
.weather-details {
  flex: 2;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.detail-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-item {
  flex: 1;
  padding: 25px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  text-align: center;
}

.detail-label {
  font-size: 15px;
  color: #606266;
  margin-bottom: 10px;
}

.detail-value {
  font-size: 28px;
  font-weight: 600;
}

/* 右侧温度范围 */
.temp-range {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.temp-range-item {
  flex: 1;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.temp-range-item.high {
  border-top: 4px solid #f56c6c;
}

.temp-range-item.low {
  border-top: 4px solid #409eff;
}

.range-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.range-value {
  font-size: 36px;
  font-weight: 700;
}

/* 建议区域 */
.suggestion-section {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.suggestion-content {
  font-size: 15px;
  line-height: 1.6;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.loading-content {
  text-align: center;
}

.loading-icon {
  color: #409eff;
  animation: rotate 2s linear infinite;
  margin-bottom: 20px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 1024px) {
  .weather-main-grid {
    flex-direction: column;
  }
  
  .weather-primary,
  .weather-details,
  .temp-range {
    width: 100%;
  }
  
  .temp-range {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .weather-detail-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .city-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .temp-number {
    font-size: 56px;
  }
  
  .range-value {
    font-size: 28px;
  }
  
  .condition-text {
    font-size: 18px;
  }
}
</style>