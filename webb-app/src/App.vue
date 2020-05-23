<template>
  <body >
    <div class="container">
      <form class="form-inline" @submit.prevent="onSubmit" >
        <div class="form-group mb-2">
          <label for="archivo" class="sr-only">Archivo</label>
          <input type="file" class="form-control-plaintext" id="archivo" required accept=".html">
        </div>
        <button type="submit" class="btn btn-primary mb-2">Analizar Archivo</button>
      </form>
      <FileContent v-bind:code="fileContent"/>
    </div>
  </body>
</template>
<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileContent from './components/FileContent.vue'

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export default {
  name: 'App',
  data() {
    return {
      fileContent: ''
    }
  },
  methods: {
    onSubmit: async function () {
      const file = document.querySelector('#archivo').files[0];
      const result = await toBase64(file).catch(e => Error(e));
      
      if(result instanceof Error) {
          console.log('Error: ', result.message);
          return;
      }

      this.axios(
        {
          method: 'post',
          url: 'https://us-central1-umg-proyectos-5d9b6.cloudfunctions.net/api/analysis/lexical',
          data: {
            htmlFile: result.replace('data:text/html;base64,',''),
          }
        }
      ).then((response) => {
        this.fileContent = JSON.stringify(response.data,undefined,'\t')
      })
    }
  },
  components: {
    FileContent
  }
}
</script>
