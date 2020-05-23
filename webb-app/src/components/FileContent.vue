<template>
  <div class="hello">
    <pre>
      <code>
      {{code}}
      </code>
    </pre>
  </div>
</template>

<script>
export default {
  name: 'FileContent',
  props: {
    code: String
  }
}
</script>
