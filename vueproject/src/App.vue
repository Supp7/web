<template>

  <el-input
      v-model="input"
      style="width: 240px"
      placeholder="请输入药品编号"
      clearable
  />
  <!--  搜索药品按钮-->
  <el-button :icon="Search" circle @click="searchDrug()"/>

  <!--  购买记录按钮-->
  <el-button type="primary" :icon="Tickets" circle @click="purchaseRecordVisible = true,showOrderData()"/>
  <!--  购物车按钮-->
  <el-button type="warning" :icon="ShoppingCart" circle @click="shoppingCartVisible = true,showShoppingCart()"/>
  <span class="balance">你的余额：{{balance}} 元</span>

  <el-table :data="tableData" style="width: 100%" height="100%" >
    <el-table-column prop="id" label="ID"/>
    <el-table-column prop="img" label="图片">
      <template #default="scope">
        <div class="demo-image__preview">
        <el-image
            style="width: 100px; height: 100px"
            v-if="scope.row.imgUrl" :src="scope.row.imgUrl"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :initial-index="4"
            :preview-teleported="true"
            :hide-on-click-modal="true"
            :preview-src-list="[scope.row.imgUrl]"
            fit="cover"
        />
          <input v-else type="file" name="uploadFile" @change="handleFileUpload(scope.row.id,$event)" >

        </div>
<!--        <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl" width="100px" height="100px"/>-->
      </template>

    </el-table-column>
    <el-table-column prop="name" label="药品名称"/>
    <el-table-column prop="price" label="药品价格"/>
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
<!--        <el-button-->
<!--            type="success"-->
<!--            size="small"-->
<!--            @click="purchase(scope.row)"-->
<!--        >-->
<!--          购买-->
<!--        </el-button>-->
        <el-button
            plain
            type="warning"
            size="small"
            @click="addShoppingCart(scope.row)"
        >
          加入购物车
        </el-button>
      </template>

    </el-table-column>

  </el-table>

  <!--  购买记录界面-->
  <el-dialog v-model="purchaseRecordVisible" title="购买记录" width="1000">
    <el-table :data="purchaseData">
      <el-table-column property="id" label="药品编号" width="100"/>
      <el-table-column property="name" label="药品名称" width="350"/>
      <el-table-column property="finalPrice" label="总价" width="100"/>
      <el-table-column property="transactionTime" label="购买时间" width="250"/>
      <el-table-column fixed="right" label="操作" >
        <template #default="scope">
          <el-button  type="danger"  :disabled="scope.row.chargeback"  @click="chargeback(scope.row)" >退单</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <!--购物车界面-->
  <el-dialog v-model="shoppingCartVisible" title="购物车" width="800">
    <el-table :data="shoppingCartData">
      <el-table-column property="id" label="药品编号" width="150"/>
      <el-table-column property="name" label="药品名称" width="150"/>
      <el-table-column property="price" label="价格" width="100"/>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="scope">
        <el-button text @click="countDown(scope.row)">-</el-button>
        <span>{{scope.row.purchaseStatus}}</span>
       <el-button text @click="countUp(scope.row)">+</el-button>
        </template>
      </el-table-column>
      <el-table-column  fixed="right" label="数量" width="80">
        <template #default="scope">
          <span>{{scope.row.purchaseStatus}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right">

        <template #default="scope">

          <el-button
              type="danger"
              size="small"
              @click="removePurchase(scope.row)"
          >
            删除
          </el-button>

        </template>

      </el-table-column>
    </el-table>
    <div class="submitOrder">
      <span class="right" >总价：{{total}} 元</span>
      <el-button class="right" type="success" @click="purchaseAll()" >购买</el-button>
    </div>
    <span>你的余额：{{balance}} 元</span>
  </el-dialog>

</template>

<script setup>
import {ShoppingCart, Tickets, Search} from '@element-plus/icons-vue'
import axios from "axios";
import {ref,computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const shoppingCartVisible = ref(false)
const purchaseRecordVisible = ref(false)
const shoppingCartData = ref([])
const purchaseData =ref([])
const input = ref()
const  balance = ref(100)
const  orderForm =ref({
  name:"",
  finalPrice:0
})
const total = computed(()=>{
  let to=0
  for (let i = 0; i < shoppingCartData.value.length; i++) {
    // eslint-disable-next-line no-unused-vars
    to+=shoppingCartData.value[i].price*shoppingCartData.value[i].purchaseStatus
  }
  return to
})

function chargeback(row){
  console.log(row.finalPrice)
  ElMessageBox.confirm(
      '是否退单',
      '提示',

      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      }
  )
      .then(() => {
        axios.get("api/order/chargeback/"+row.id).then((res)=>{

          console.log(res.data)
          if (res.data!==''){
            balance.value+=row.finalPrice

            ElMessage({
              type: 'success',
              message: '退单成功！',
            })

            showOrderData()
          }

        })

      })
      .catch(() => {

      })
}

const handleFileUpload =(id,event)=>{
  const file = event.target.files[0];
  let formData = new FormData();
  formData.append('file',file);
  formData.append('id',id)
  axios.post("api/drug/upload",formData).then((res)=>{
    console.log(res.data)
    show()
  })


}


function showOrderData(){
  axios.get('/api/order').then((res)=>{
    purchaseData.value =res.data
    console.log( res.data)
  })
}


function purchaseAll(){
  if (total.value<=balance.value){
    let d = ""
    for (const drug of shoppingCartData.value) {
      // eslint-disable-next-line no-unused-vars

        d+="-"+drug.name+"*"+drug.purchaseStatus
    }
    orderForm.value.name=d.slice(1)
    orderForm.value.finalPrice=total.value
    console.log(orderForm.value)

    axios.post('/api/order/add',orderForm.value).then((require) => {
      if (require!==""){
        ElMessage({
          message: '购买成功！',
          type: 'success',
        })

        for (const data of shoppingCartData.value) {
          axios.get('/api/drug/removePurchase/' + data.id).then(() => {

          })
        }
        balance.value-=total.value
        shoppingCartData.value=[]

      }
    })

  }else {
    ElMessage({
      message: '余额不足，请充值！',
      type: 'error',
    })
  }
}


function show() {
  axios.get('/api/drug').then((require) => {
    tableData.value = require.data
    console.log(require.data)
  })
}

// 解决ERROR ResizeObserver loop completed with undelivered notifications.

//问题的

const debounce = (fn, delay) => {

  let timer = null;

  return function () {

    let context = this;

    let args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {

      fn.apply(context, args);

    }, delay);

  }

}

// 解决ERROR ResizeObserver loop completed with undelivered notifications.

//问题的

const _ResizeObserver = window.ResizeObserver;

window.ResizeObserver = class ResizeObserver extends _ResizeObserver {

  constructor(callback) {

    callback = debounce(callback, 16);

    super(callback);

  }

}

show()

// 购买药品请求
// function purchase(row) {
//   console.log(row.id)
//
// }

function countUp(row){
  row.purchaseStatus++



}
function countDown(row){
  if (row.purchaseStatus>1){
    row.purchaseStatus--
  }
}
// 加入购物车请求
function addShoppingCart(row) {
  axios.get('/api/drug/checkShoppingCart/' + row.id).then((require) => {
    if (require.data === 0) {
      axios.get('/api/drug/purchase/' + row.id).then(() => {
        ElMessage({
          message: '添加购物车成功！',
          type: 'success',
        })
      })
    } else {
      ElMessage({
        message: '已经添加到购物车！',
        type: 'warning',
      })
    }

  })


}

// 购物车数据请求
function showShoppingCart() {
  axios.get('/api/drug/shoppingCart').then((require) => {
    shoppingCartData.value = require.data
  })
}

// 移除购物车数据
function removePurchase(row) {
  axios.get('/api/drug/removePurchase/' + row.id).then(() => {
    showShoppingCart()
  })
}

//搜索药品
function searchDrug() {
  console.log(input.value)
  if (input.value === undefined || input.value === "" ) {

    ElMessage({
      message: '请输入编号！',
      type: 'danger',

    })
    show()
  } else {

    axios.get('/api/drug/' + input.value).then((require) => {
      console.log(require.data)
      tableData.value = [require.data]
    })
  }

}

</script>

<style lang="scss">
.submitOrder{
  display: flex;
  justify-content: flex-end;
}
.right{
  margin-top: 10px;
  margin-right: 20px;
}
.demo-image__error .image-slot {
  font-size: 30px;
}
.demo-image__error .image-slot .el-icon {
  font-size: 30px;
}
.demo-image__error .el-image {
  width: 100%;
  height: 200px;
}
.balance{
  position: absolute;
  right: 10px;

}
</style>
