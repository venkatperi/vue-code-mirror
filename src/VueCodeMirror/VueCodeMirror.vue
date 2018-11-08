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

<!--suppress TypeScriptValidateTypes, CheckEmptyScriptTag -->
<template>
  <div :class="['vue-code-mirror-wrapper', xClass]">
    <!--suppress HtmlFormInputWithoutLabel -->
    <textarea ref="textarea" :placeholder="placeholder" />
    <div class="all-markers"></div>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
    import { EditorFromTextArea, fromTextArea } from 'codemirror'
    import 'codemirror/lib/codemirror.css'
    import ResizeSensor from 'css-element-queries/src/ResizeSensor'
    import Vue from 'vue'
    import { Marker, MarkerElement, toTracked, TrackedMarkers } from "../types";
    import { createMarker } from "../util";
    import { WatchAllCallback } from "../VueWatchAll";
    import { CodeMirrorOptions, events, props } from './CodeMirrorTypes';

    const diff = require('lodash.difference')

    @Component({
        name: "VueCodeMirror",
        inheritAttrs: false,
        props: {
            markers: {type: Array, default: () => []}
        },
    })
    export default class VueCodeMirror extends Vue {
        // noinspection JSUnusedGlobalSymbols
        $refs!: {
            textarea: HTMLTextAreaElement
        }

        content = ""

        cm?: EditorFromTextArea

        markers!: Array<Marker>

        currentMarkers: TrackedMarkers = {}

        parentResizeSensor?: ResizeSensor = undefined

        @Prop value = p({type: String, default: ''})

        @Prop lineSeparator = p(String)

        @Prop xClass = p(String)

        @Prop theme = p({type: String, required: true})

        @Prop mode = p({type: String, required: true})

        @Prop indentUnit = p(Number)

        @Prop smartIndent = p(Boolean)

        @Prop tabSize = p(Number)

        @Prop indentWithTabs = p(Boolean)

        @Prop electricChars = p(Boolean)

        @Prop specialChars = p(RegExp)

        @Prop specialCharPlaceHolder = p(Function)

        @Prop direction = p(String)

        @Prop rtlMoveVisually = p(Boolean)

        @Prop keyMap = p(String)

        @Prop extraKeys = p(Object)

        @Prop lineWrapping = p(Boolean)

        @Prop lineNumbers = p(Boolean)

        @Prop gutters = p({type: Array})

        @Prop fixedGutter = p(Boolean)

        @Prop scrollbarStyle = p(String)

        @Prop coverGutterNextToScrollbar = p(Boolean)

        @Prop inputStyle = p({type: String, default: 'contenteditable'})

        @Prop readOnly = p(Boolean)

        @Prop showCursorWhenSelecting = p(Boolean)

        @Prop lineWiseCopyCut = p(Boolean)

        @Prop pasteLinesPerSelection = p(Boolean)

        @Prop selectionsMayTouch = p(Boolean)

        @Prop undoDepth = p(Number)

        @Prop historyEventDelay = p(Number)

        @Prop tabIndex = p(Number)

        @Prop autoFocus = p(Boolean)

        @Prop phrases = p(Object)

        @Prop dragDrop = p(Boolean)

        @Prop allowDropFileTypes = p({type: Array})

        @Prop cursorBlinkRate = p(Number)

        @Prop cursorScrollMargin = p(Number)

        @Prop cursorHeight = p(Number)

        @Prop viewportMargin = p({type: Number, default: Infinity})

        @Prop placeholder = p({type: String, default: '',})

        @Watch('markers')
        onMarkersChanged() {
            let tracked = toTracked(this.markers)
            let k1 = Object.keys(tracked)
            let k2 = Object.keys(this.currentMarkers)
            let added: Array<string> = diff(k1, k2)
            let removed: Array<string> = diff(k2, k1)
            for (let k of removed) {
                let m: Marker = this.currentMarkers[k]
                this.removeMarker(m.line, m.gutter)
            }
            for (let k of added) {
                let m: Marker = tracked[k]
                if (m) {
                    this.addMarker(m.line, m.gutter, m.element)
                }
            }
            this.currentMarkers = tracked
        }

        @Lifecycle created() {
            this.content = this.value
        }

        @Lifecycle mounted() {
            let self = this
            this.cm = fromTextArea(this.$refs.textarea, this.options)
            if (this.cm) {
                this.cm.setValue(this.value)
                this.cm.on('change', cm => {
                    self.content = cm.getValue()
                })
                this.loadMode()
                this.loadTheme()
                this.watchOptions()
                this.addEventListeners()
                this.trackParentSize()
                this.refresh()
            }
        }

        trackParentSize() {
            let parent = this.$el.parentElement
            if (parent) {
                let self = this
                this.setSize(parent.clientWidth, parent.clientHeight)
                this.parentResizeSensor = new ResizeSensor(parent,
                    (size: { width: number, height: number }) => {
                        self.setSize(size.width, size.height)
                    })
            }
        }

        get options(): CodeMirrorOptions {
            let opts: { [k in string]: any } = {}
            for (const prop of props) {
                if (this.$props[prop]) {
                    opts[prop] = this.$props[prop]
                }
            }
            return opts
        }

        // noinspection JSUnusedGlobalSymbols
        $watchAll(props: string[], callback: WatchAllCallback) {
            for (const prop of props) {
                this.$watch(prop, function (n: any, o: any) {
                    callback(prop, n, o)
                });
            }
        }

        watchOptions() {
            let self = this
            this.$watchAll(props, function (name: string, n: any,) {
                if (self.cm) {
                    self.cm.setOption(name, n)
                }
            })
        }

        addEventListeners() {
            if (this.cm) {
                for (const event of events) {
                    let self = this
                    this.cm.on(event, (...args) => self.$emit(event, ...args))
                }
            }
        }

        addMarker(line: number, gutter: string, m?: MarkerElement) {
            if (this.cm && m) {
                let marker = typeof m === 'string' ? createMarker(m, gutter) : m
                let el = marker instanceof HTMLElement ? marker : marker.$el
                this.cm.setGutterMarker(line, gutter, el)
            }
        }

        // noinspection JSUnusedGlobalSymbols
        clearGutter(gutter: string) {
            if (this.cm) {
                this.cm.clearGutter(gutter)
            }
        }

        removeMarker(line: number, gutter: string) {
            if (this.cm) {
                this.cm.setGutterMarker(line, gutter, null)
            }
        }

        refresh() {
            setTimeout(() => {
                if (this.cm) {
                    this.cm.refresh()
                }
            }, 0)
        }

        @Watch('value')
        valueChanged() {
            this.content = this.value
        }

        @Watch('mode')
        modeChanged() {
            this.loadMode()
        }

        @Watch('theme')
        themeChanged() {
            if (this.cm) {
                this.cm.setOption('theme', this.theme)
            }
            this.loadTheme()
        }

        @Watch('content')
        contentChanged() {
            this.$emit('input', this.content)
        }

        loadMode() {
            // noinspection TypeScriptUnresolvedFunction
            require(`codemirror/mode/${this.mode}/${this.mode}`)
        }

        loadTheme() {
            // noinspection TypeScriptUnresolvedFunction
            require(`codemirror/theme/${this.theme}.css`)
        }

        setSize(width: number, height: number) {
            if (this.cm) {
                this.cm.setSize(width, height)
            }
        }
    }
</script>

<style type="scss" module>
  .wrapper {
    display: flex;
    .CodeMirror, .CodeMirror-scroll {
      height: inherit !important;
    }
    .CodeMirror-sizer {
      min-height: initial !important;
    }
  }
</style>
