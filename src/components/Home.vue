<template>
<el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
        <!-- 图片标题 -->
        <div class="">
          <img src="../assets/heima.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <!-- 退出区域 -->
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <!-- 点击按钮显示隐藏侧边栏 -->
          <div class="toggle-button" @click="toggleCollapse">III</div>

          <!-- 侧边栏菜单区 -->
            <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFE"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-active="avtivePath"
            >


            <!-- 一级菜单区域 -->
            <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>


              <!-- 二级菜单 -->
                <el-menu-item :index=" '/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                  <!-- 二级菜单模板区域 -->
                  <template slot="title">
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文本 -->
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧主题内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
 </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      // 控制侧边栏折叠
      isCollapse: false,
      // 被激活的链接地址
      avtivePath: ''
    };
  },
  created() {
    this.getMenuList()  
    this.avtivePath = window.sessionStorage.getItem('avtivePath')
  },
  methods: {
    // 点击退出按钮，先摧毁token，在跳转到登录页面
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 请求侧边栏数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      
      if(res.meta.status !== 200) {
        return this.$Message.error(res.meta.msg);
      } else {
        this.menuList = res.data
      }
      // console.log(res);
    },
    // 点击按钮切换菜单折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保持链接的激活状态
    saveNavState(avtivePath) {
      window.sessionStorage.setItem('avtivePath',avtivePath)
      this.avtivePath = avtivePath
    }
  },

};
</script>r

<style lang="less" scoped>
.el-header {
  color: #fff;
  font-size: 20px;
  background-color: #373d41;
  padding-left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
  // padding: 0;
  // margin: 0;
}
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>