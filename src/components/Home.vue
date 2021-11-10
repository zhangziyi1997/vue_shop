<template>
  <div>
    <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    // 点击退出按钮，先摧毁token，在跳转到登录页面
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
  },
};
</script>

<style>
</style>