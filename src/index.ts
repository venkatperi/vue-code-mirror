import { PluginObject, VueConstructor } from 'vue'
import VueCodeMirror from './VueCodeMirror/VueCodeMirror.vue'

const plugin: PluginObject<any> = {
    install(Vue: VueConstructor) {
        Vue.component('vue-code-mirror', VueCodeMirror)
    }
}

export default VueCodeMirror

export
{
    plugin
}

// @ts-ignore
VueCodeMirror.install = plugin.install

declare global {
    interface Window {
        Vue: VueConstructor
    }
}

if (window && window.Vue) {
    // @ts-ignore
    window.Vue.use(VueCodeMirror)
}

