<script setup lang="ts">
import PhTextIndentBold from '~icons/ph/text-indent-bold';

interface IView {
  type: string;
  props: object;
  children: IView[];
  status?: number;
}

const views = $ref<IView[]>([]);

let dragMaterial = $ref<string | undefined>();
let dragIndex = $ref<string | undefined>();
let isPushed = false;
function dragStart(e: DragEvent) {
  console.log('drag start');
  dragMaterial = e.target.dataset.material;
}
function dragEnd() {
  console.log('drag end', dragIndex);
  if (dragIndex === undefined) return;
  if (!views[dragIndex]) return;
  delete views[dragIndex].status;
  isPushed = false;
  dragMaterial = undefined;
  dragIndex = '';
}
function drop() {
  console.log('drop');
  if (!dragMaterial) return;
  dragEnd();
}
function dragOver(e) {
  console.log('drag over');
  if (!dragMaterial) return;
  const { type } = e.target.dataset;
  if (!type) return;
  let defaultData: IView | null = null;
  if (dragMaterial === 'section') {
    defaultData = {
      type: 'section',
      props: {
        underline: false,
      },
      children: [
        {
          type: 'text',
          props: {
            text: '',
          },
          children: [],
        },
      ],
      status: 2,
    };
  }
  if (type === 'page') {
    if (!isPushed) {
      dragIndex = views.length;
      isPushed = true;
      views.push(defaultData);
    }
  } else {
    let target: HTMLElement;
    if (type === 'section') {
      target = e.target;
    } else {
      target = e.target.parentElement;
    }
    let [y, h, curIndex] = [
      e.offsetY,
      target.offsetHeight,
      +target.dataset.index,
    ];
    const isTop = y < h / 2;
    if (!isPushed) {
      // Push to Top or Bottom
      if (isTop) {
        if (curIndex === 0) {
          views.unshift(defaultData);
        } else {
          views.splice(curIndex, 0, defaultData);
        }
      } else {
        curIndex = curIndex + 1;
        views.splice(curIndex, 0, defaultData);
      }
    } else {
      // Moving
      let result;
      if (isTop) {
        const i = curIndex === 0 ? 0 : curIndex - 1;
        console.log(1111, i, views[i]);
        result = views[i]['status'] === 2;
      } else {
        const i = +curIndex + 1;
        console.log(222, views[i]);
        result = views.length > i && views[i]['status'] === 2;
      }
      if (result) return;
      const temp = views.splice(dragIndex, 1);
      views.splice(curIndex, 0, temp[0]);
    }
    dragIndex = curIndex;
    isPushed = true;
  }
}

const editData = reactive<{
  type?: string;
  props?: object;
}>({
  type: undefined,
  props: {},
});
function mousedown(e: MouseEvent) {
  const { type } = e.target.dataset;
  let target;
  if (type === 'text') {
    target = e.target.parentElement;
  } else if (type === 'section') {
    target = e.target;
  } else {
    return;
  }
  editData.type = 'section';
  editData.props = views[target.dataset.index].props;
  console.log('mousedown', editData);
}
</script>
<template>
  <div class="container">
    <div class="left">
      <ul @dragstart="dragStart" @dragend="dragEnd">
        <li data-material="section" draggable="true">
          <el-icon size="40px">
            <PhTextIndentBold />
          </el-icon>
          <p>段落</p>
        </li>
      </ul>
    </div>
    <div class="middle">
      <div
        class="content"
        @drop.prevent.stop="drop"
        @dragover.prevent.stop="dragOver"
        @mousedown="mousedown"
      >
        <div class="page" data-type="page" data-index="0">
          <template v-for="(item, index) in views">
            <!-- waiting -->
            <template v-if="item.status === 2">
              <div :key="index" class="wait" :title="item.type"></div>
            </template>
            <template v-else>
              <p
                v-if="item.type === 'section'"
                :key="index"
                data-type="section"
                :data-index="index"
                :style="{
                  textDecoration: item.props.underline ? 'underline' : 'none',
                }"
              >
                <span v-for="textItem of item.children" data-type="text">
                  {{ textItem.props.text || '文本内容' }}
                </span>
              </p>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="right">
      <template v-if="editData.type">
        <div class="field">
          <div class="field__label">下划线</div>
          <div class="field__content">
            <el-switch v-model="editData.props.underline" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  height: 100%;
  display: flex;
}

.left {
  width: 300px;
  height: 100%;
  padding: 15px 0;
  background: #fff;
  background-color: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 820;

  ul {
    margin: 0;
    padding: 0;

    li {
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      cursor: default;
      list-style: none;
      font-size: 14px;
      color: #666;
      float: left;
      margin: 0 10px;
      border-radius: 6px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        background: #efefef;
      }

      span {
        display: block;
        font-size: 40px;
        margin-bottom: 8px;
        color: #999;
      }

      p {
        display: block;
        margin: 0;
        font-size: 12px;
      }
    }
  }
}

.middle {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 2px;
  z-index: 10;
}

.right {
  height: 100%;
  width: 500px;
  background-color: #fff;
  flex-shrink: 0;
  margin-left: 2px;
  position: relative;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.page {
  font-family: SIMSUN;
  width: 595px;
  min-height: 842px;
  margin: 30px auto;
  padding: 20px 40px;
  background-color: #fff;
  line-break: anywhere;

  p {
    margin: 0;
  }
}

.wait {
  background: #006cff;
  height: 4px;
}

.field {
  display: flex;
  align-items: center;
  margin: 12px;

  &__label {
    width: 100px;
    margin-right: 20px;
    text-align: right;
    color: rgba(0, 0, 0, 0.6);
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }
}
</style>
