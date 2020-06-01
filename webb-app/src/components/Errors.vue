<template>
  <div >
    <div class="alert alert-danger" role="alert" v-for="(error,index) in errors" v-bind:key="index">
      {{error}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Errors',
  props: {
    errors: Array
  }
}
</script>
