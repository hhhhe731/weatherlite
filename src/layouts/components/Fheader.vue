<template>
  <div class="f-header">
    <span class="logo">
        <el-icon  class="mr-2" :size="40" color="yellow"><StarFilled /></el-icon>
        <span class="flex-1 mr-2">
            天气速查
        </span>
        <el-icon class="icon-btn" @click="DoRefresh"><Refresh /></el-icon>
    </span>
  </div>
</template>

<script setup>
const DoRefresh=()=>location.reload()
</script>

<style>
.f-header{
    @apply flex items-center bg-sky-100 text-gray-800 fixed top-0
    left-0 right-0 text-2xl font-bold;
    height:64px;
}
.logo{
    @apply flex justify-center items-center
}
.icon-btn{
    @apply flex justify-center items-center
    height:64px;
    cursor:pointer;
}
</style>