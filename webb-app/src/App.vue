<template>
  <body >
    <div class="container">
      <form class="form-inline" @submit.prevent="onSubmit" >
        <div class="form-group mb-2">
          <label for="archivo" class="sr-only">Archivo</label>
          <input type="file" class="form-control-plaintext" id="archivo" required>
        </div>
        <button type="submit" class="btn btn-primary mb-2">Analizar Archivo</button>
      </form>
      <Errors v-bind:errors="errors" />
      <FileContent v-bind:code="fileContent"/>
    </div>
  </body>
</template>
<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileContent from './components/FileContent.vue'
import Errors from './components/Errors.vue'

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
      fileContent: '',
      errors: []
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

      this.fileContent = ''
      this.errors = []

      this.axios(
        {
          method: 'post',
          url: 'https://us-central1-umg-proyectos-5d9b6.cloudfunctions.net/api/analysis',
          data: {
            htmlFile: result.replace('data:text/html;base64,',''),
          }
        }
      ).then((response) => {
        let data = response.data

        this.fileContent = JSON.stringify(data.tokens,undefined,'\t')

        data.errors.forEach(e => this.errors.push(e))

      })
    }
  },
  components: {
    FileContent,
    Errors
  }
}
</script>
