import { createRouter,createWebHashHistory } from "vue-router";
import index from "../pages/index.vue";
import component from "element-plus/es/components/tree-select/src/tree-select-option.mjs";
import Index from "../pages/index.vue";
import WeatherDetail from "../pages/weatherDetail.vue";
const routes=[{
    path:"/",
    component:Index
},
{
    path:"/weather-detail",
    name:"WeatherDetail",
    component:WeatherDetail

}]

const router=createRouter({
    history:createWebHashHistory(),
    routes,
})
export default router