import { apolloClient } from '@/apollo-client'
import App from '@/App.vue'
import router from '@/router'
import Chakra from '@chakra-ui/vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import VueCompositionApi, { provide } from '@vue/composition-api'
import Vue from 'vue'
import { Plugin } from 'vue-fragment'

Vue.config.productionTip = false

Vue.use(Plugin)
Vue.use(Chakra)
Vue.use(VueCompositionApi)

new Vue({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  router: router,
  render: h => h(App)
}).$mount('#app')
