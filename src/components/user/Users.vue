<template>
    <div>
        <!-- 面包屑导航器 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>   
        </el-card>

        <!-- 用户列表区域 -->
        <el-table :data="userList" border  stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态">
                <template slot-scope="scope">
                    <el-switch
                    v-model="scope.row.mg_state"
                    active-color="#13ce66"
                    inactive-color="#ff4949" @change="userStateChanged(scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 -->
                    <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false"> 
                        <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>


        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>

        <!-- 添加用户的对话框 -->
        <el-dialog
        title="提示"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
        >
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>    
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
        </el-dialog>


        <!-- 修改用户对话框 -->
        <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
        <!-- 主体区 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
              <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>  
        <!-- 底部区 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    name: 'VueShopUsers',

    data() {
        // 自定义验证邮箱规则
         var checkEmail = (rule, value, callback) => {
                // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                
            if(regEmail.test(value)) {
                    // 合法邮箱
                return callback()
             }else {
                callback(new Error('输入邮箱不合法'))
            }
        }
            // 自定义验证手机号规则  
        var checkMobile = (rule, value, cb) => {
             // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

            if (regMobile.test(value)) {
                return cb()
            }

                cb(new Error('请输入合法的手机号'))
        }


        return {  
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',
                // 当前页码
                pagenum: 1,
                // 当前数据
                pagesize: 2
            },
            userList: [],
            total: 0,
            // 控制添加用户对话框显示隐藏
            addDialogVisible: false,
            // 添加用户表单数据
            addForm: {
                username: '',
                password: '',
                email:'',
                mobile:''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { min: 3, max: 10,message: "用户名长度在 3 到 10 个字符",trigger: "blur",},
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { min: 6, max: 15,message: "用户名长度在 6 到 15 个字符",trigger: "blur",},  
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { validator: checkEmail,trigger: "blur" }
                ],
                mobile: [
                    { required: true, message: "请输入手机", trigger: "blur" },
                    { validator: checkMobile,trigger: "blur" }
                ]
            },
            // 控制修改用户对话框的显示隐藏
            editDialogVisible: false,
            // 通过ID查询到的用户信息
            editForm: {},
            // 修改表单验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { validator: checkEmail,trigger: "blur" }
                ],
                mobile: [
                    { required: true, message: "请输入手机", trigger: "blur" },
                    { validator: checkMobile,trigger: "blur" }
                ]
            }
        };
    },

    mounted() {
        
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('users',{ params: this.queryInfo })
            if(res.meta.status !== 200) {
                return this.$Message.error(res.meta.msg);
            } else {
                this.userList = res.data.users;
                this.total = res.data.total;
            }
            console.log(res);
        },
        // 监听switch开关状态的改变
        async userStateChanged(userInfo) {
            // console.log(userInfo);
            const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if(res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$Message.error('更新用户状态失败');    
            } 
            this.$Message.success('更新用户状态成功'); 
        },
        // 监听添加用户对话框关闭时间
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async (valid) => {
                // console.log(valid);
                if(!valid) return
                // 可以发起真正的添加用户的网络请求
                const { data: res } = await this.$http.post('users', this.addForm)

                if (res.meta.status !== 201) {
                this.$Message.error('添加用户失败！')
                }

                this.$Message.success('添加用户成功！')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                // 重新获取用户列表数据
                this.getUserList()
            })
        },
        //展示编辑用户的对话框
        async showEditDialog(id) {
            // console.log(id);
            // 发起根据ID查询用户
            const { data: res } = await this.$http.get(`users/${id}`)
            if(res.meta.status !== 200) {
                return this.$Message.error('查询用户信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改用户对话框关闭时间
        editDialogClosed() {
            tihs.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                // console.log(valid);
                if (!valid) return
                // 发起修改用户信息的数据请求
                const { data: res } = await this.$http.put('users/' + this.editForm.id,
                {
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if (res.meta.status !== 200) {
                return this.$Message.error('更新用户信息失败！')
                }

                // 关闭对话框
                this.editDialogVisible = false
                // 刷新数据列表
                this.getUserList()
                // 提示修改成功
                this.$Message.success('更新用户信息成功！')
            })
        },
        // 点击删除按钮，根据id删除用户信息
        async removeUserById(id) {
            // 弹框用户是否删除
            const confirmResult = await this.$confirm('此操作将该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消了删除，则返回值为字符串 cancel
            // console.log(confirmResult);
            if(confirmResult !== 'confirm') {
                return this.$Message.info('已取消删除')
            }else {
                const { data: res } = await this.$http.delete(`users/${id}`)
                if(res.meta.status !== 200) {
                     return this.$Message.error('删除用户信息失败！')
                } else {
                    return this.$Message.success('删除用户信息成功！')
                    // 刷新数据列表
                    this.getUserList()
                }
            }
        },


        // 监听当前数据改变
        handleSizeChange(newSize) {
            // console.log(newSize);
            this.queryInfo.pagesize = newSize;
            this.getUserList()
        },

        // 监听页码改变
        handleCurrentChange(newPage) {
            // console.log(ewPage);
            this.queryInfo.pagenum = newPage;
            this.getUserList()
        }
    },
};
</script>

<style lang="scss" scoped>

</style>