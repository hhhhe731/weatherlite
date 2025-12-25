<template>
  <div class="weather-container">
    <!-- 标题和时间 -->
    <div class="header">
      <div class="title-section">
        <h2>城市天气</h2>
        <div class="time">更新时间: {{ updateTime }}</div>
      </div>
      <div class="unit-switch">
        <el-radio-group v-model="temperatureUnit" @change="handleUnitChange">
          <el-radio label="celsius" size="small">°C</el-radio>
          <el-radio label="fahrenheit" size="small">°F</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 天气卡片 -->
    <div class="cards-container">
      <div v-if="!displayWeather.length" class="empty-state">
        <el-icon class="empty-icon"><Search /></el-icon>
        <p>暂无天气数据，请在搜索框查询城市</p>
      </div>

      <div 
        v-for="city in displayWeather" 
        :key="city.city"
        class="city-card"
        @click="showWeatherDetail(city)"
      >
        <div class="card-header">
          <el-icon class="location-icon"><Location /></el-icon>
          <span class="city-name">{{ city.city }}</span>
          <el-icon 
            class="collect-icon" 
            :class="{ collected: isCollected(city.city) }"
            @click.stop="toggleCollect(city.city)"
          >
            <StarFilled v-if="isCollected(city.city)" />
            <Star v-else />
          </el-icon>
        </div>

        <div class="weather-content">
          <el-icon class="weather-icon" :class="getIconClass(city.condition)">
            <component :is="getWeatherIcon(city.condition)" />
          </el-icon>
          <div class="temperature">
            <span class="temp-value">{{ formatTemperature(city.temperature) }}</span>
            <span class="temp-unit">{{ temperatureUnit === 'celsius' ? '°C' : '°F' }}</span>
          </div>
        </div>
        <div class="condition">{{ city.condition }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button 
        type="primary" 
        :icon="Refresh" 
        @click="refreshWeather"
        size="small"
        :loading="refreshing"
      >
        刷新数据
      </el-button>
      <el-button 
        type="text" 
        :icon="StarFilled" 
        size="small"
        @click="collectVisible = true"
        v-if="collectedCities.length"
      >
        已收藏({{ collectedCities.length }})
      </el-button>
    </div>

    <!-- 收藏列表弹窗 -->
    <el-dialog v-model="collectVisible" title="我的收藏城市" width="300px">
      <div class="collect-list">
        <div 
          v-for="city in collectedCities" 
          :key="city"
          class="collect-item"
          @click="handleCollectClick(city)"
        >
          <span>{{ city }}</span>
          <el-icon @click.stop="toggleCollect(city)">
            <Close />
          </el-icon>
        </div>
        <div v-if="!collectedCities.length" class="empty-collect">
          <p>暂无收藏城市</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Location,
  Sunny,
  Cloudy,
  Umbrella,
  Refresh,
  Search,
  Star,
  StarFilled,
  Close
} from '@element-plus/icons-vue'
import { ElRadioGroup, ElRadio, ElDialog, ElMessage, ElButton } from 'element-plus'

const router = useRouter()

const props = defineProps({
  weatherData: {
    type: Array,
    default: () => []
  }
})

// 数据
const defaultWeather = ref([
  { city: '北京', condition: '晴', temperature: '23', humidity: '45%', windSpeed: '12', feelsLike: '22', aqi: '良' },
  { city: '上海', condition: '多云', temperature: '25', humidity: '65%', windSpeed: '8', feelsLike: '26', aqi: '优' },
  { city: '广州', condition: '雨', temperature: '28', humidity: '85%', windSpeed: '15', feelsLike: '30', aqi: '良' },
  { city: '深圳', condition: '阴', temperature: '27', humidity: '78%', windSpeed: '10', feelsLike: '28', aqi: '优' },
  { city: '杭州', condition: '多云', temperature: '24', humidity: '60%', windSpeed: '9', feelsLike: '25', aqi: '优' }
])

const updateTime = ref('')
const temperatureUnit = ref('celsius')
const refreshing = ref(false)
const collectedCities = ref([])
const collectVisible = ref(false)

// 计算属性
const displayWeather = computed(() => {
  return props.weatherData.length > 0 ? props.weatherData : defaultWeather.value
})

// 初始化
onMounted(() => {
  updateTime.value = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  const saved = localStorage.getItem('weatherCollectedCities')
  if (saved) collectedCities.value = JSON.parse(saved)
  
  watch(() => props.weatherData, () => {
    updateTime.value = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  })
})

// 核心功能
const handleUnitChange = () => {
  ElMessage.success(`已切换为${temperatureUnit.value === 'celsius' ? '摄氏度' : '华氏度'}`)
}

const formatTemperature = (temp) => {
  const celsius = parseInt(temp)
  if (temperatureUnit.value === 'fahrenheit') {
    return Math.round(celsius * 9/5 + 32)
  }
  return celsius
}

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

const refreshWeather = () => {
  refreshing.value = true
  setTimeout(() => {
    displayWeather.value.forEach(city => {
      const baseTemp = parseInt(city.temperature)
      const variation = Math.floor(Math.random() * 3) - 1
      city.temperature = (baseTemp + variation).toString()
      city.feelsLike = (parseInt(city.temperature) + Math.floor(Math.random() * 3) - 1).toString()
    })
    updateTime.value = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    refreshing.value = false
    ElMessage.success('天气数据已刷新')
  }, 800)
}

const isCollected = (cityName) => {
  return collectedCities.value.includes(cityName)
}

const toggleCollect = (cityName) => {
  const index = collectedCities.value.indexOf(cityName)
  if (index !== -1) {
    collectedCities.value.splice(index, 1)
    ElMessage.info(`已取消收藏${cityName}`)
  } else {
    collectedCities.value.push(cityName)
    ElMessage.success(`已收藏${cityName}`)
  }
  localStorage.setItem('weatherCollectedCities', JSON.stringify(collectedCities.value))
}

// 修改后的 handleCollectClick 函数
const handleCollectClick = (cityName) => {
  // 先尝试从默认数据中查找
  const allCities = [...defaultWeather.value, ...props.weatherData]
  const targetCity = allCities.find(item => item.city === cityName)
  
  if (targetCity) {
    // 如果找到了，跳转到详情页
    router.push({
      path: '/weather-detail',
      query: {
        city: targetCity.city,
        condition: targetCity.condition,
        temperature: targetCity.temperature,
        feelsLike: targetCity.feelsLike || targetCity.temperature,
        aqi: targetCity.aqi || '未知',
        humidity: targetCity.humidity,
        windSpeed: targetCity.windSpeed
      }
    })
  } else {
    // 如果收藏的城市不在现有数据中，生成模拟数据
    const getRandomCondition = () => {
      const conditions = ['晴', '多云', '阴', '雨', '大雨', '雷雨', '雾']
      return conditions[Math.floor(Math.random() * conditions.length)]
    }
    
    const getRandomTemperature = () => {
      // 生成-10到35之间的随机温度
      return Math.floor(Math.random() * 45) - 10
    }
    
    const getRandomAqi = () => {
      const aqiLevels = ['优', '良', '轻度污染', '中度污染', '重度污染']
      return aqiLevels[Math.floor(Math.random() * 3)]
    }
    
    const getRandomHumidity = () => {
      return Math.floor(Math.random() * 50) + 30 + '%'
    }
    
    const getRandomWindSpeed = () => {
      return Math.floor(Math.random() * 8) + 1 + '级'
    }
    
    // 使用模拟数据跳转
    router.push({
      path: '/weather-detail',
      query: {
        city: cityName,
        condition: getRandomCondition(),
        temperature: getRandomTemperature().toString(),
        feelsLike: getRandomTemperature().toString(),
        aqi: getRandomAqi(),
        humidity: getRandomHumidity(),
        windSpeed: getRandomWindSpeed()
      }
    })
  }
  
  // 关闭收藏弹窗
  collectVisible.value = false
}

const showWeatherDetail = (city) => {
  router.push({
    path: '/weather-detail',
    query: {
      city: city.city,
      condition: city.condition,
      temperature: city.temperature,
      feelsLike: city.feelsLike || city.temperature,
      aqi: city.aqi || '未知'
    }
  })
}
</script>

<style scoped>
.weather-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title-section h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.time {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  min-height: 300px;
}

.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fafafa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.city-card {
  width: 180px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.city-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.location-icon {
  color: #1890ff;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.collect-icon {
  color: #c0c4cc;
  cursor: pointer;
}

.collect-icon.collected {
  color: #faad14;
}

.weather-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.weather-icon {
  font-size: 48px;
}

.sunny { color: #faad14; }
.cloudy { color: #8c8c8c; }
.rain { color: #1890ff; }

.temperature {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.temp-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.temp-unit {
  font-size: 16px;
  color: #666;
}

.condition {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.collect-list {
  max-height: 200px;
  overflow-y: auto;
}

.collect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.collect-item:hover {
  color: #409eff;
}

.empty-collect {
  text-align: center;
  padding: 20px;
  color: #909399;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .cards-container {
    gap: 12px;
  }
  
  .city-card {
    width: calc(50% - 6px);
  }
  
  .actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>