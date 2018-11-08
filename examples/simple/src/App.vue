<!--
  // Copyright 2018, Venkat Peri.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  -->

<template>
  <vue-splitter-h>
    <template slot="top">
      <vue-splitter-v>
        <template slot="left">
          <vue-code-mirror class="cm"
                           value="ONE"
                           mode="javascript"
                           :line-numbers="true"
                           :markers="markersA"
                           :gutters='[ "errors"]'
                           theme="midnight" />
        </template>
        <template slot="right">
          <vue-code-mirror class="cm"
                           value="THREE"
                           mode="javascript"
                           :line-numbers="true"
                           :markers="markersC"
                           :gutters='[ "errors"]'
                           theme="midnight" />
        </template>
      </vue-splitter-v>
    </template>
    <template slot="bottom">
      <vue-code-mirror class="cm"
                       value="TWO"
                       mode="javascript"
                       :line-numbers="true"
                       :markers="markersB"
                       :gutters='[ "errors"]'
                       theme="midnight" />
    </template>
  </vue-splitter-h>
</template>


<script lang="ts">
    import { Component, Lifecycle } from "av-ts";
    import Vue from 'vue'
    import { VueSplitterH, VueSplitterV } from 'vue-splitter-pane'
    import { Marker } from "../../../src/types";
    import VueCodeMirror from '../../../src/VueCodeMirror/VueCodeMirror.vue'

    @Component({
        name: "App",
        components: {
            VueCodeMirror,
            VueSplitterH,
            VueSplitterV,
        }
    })
    export default class App extends Vue {

        markersA: Array<Marker> = []

        markersB: Array<Marker> = []

        markersC: Array<Marker> = []

        @Lifecycle mounted() {
            let self = this
            setTimeout(() => {
                self.markersA.push({line: 1, gutter: 'errors', element: '❌'})
            }, 500)
            setTimeout(() => {
                self.markersB.push({line: 1, gutter: 'errors', element: '?'})
            }, 1000)
        }

    }
</script>

<style lang="scss" module>
  :global body {
    margin: 0;
    padding: 0;
  }

  :global #app {
    width: 100%;
    height: 100vh;
  }

  :global .cm {
    width: 100%;
    height: 100%;
  }

  :global .gutter-marker {
    font-size: 8px;
    margin-left: 3px;
  }

</style>

