<template>
  <Graphin :data="data" :layout="layout">
    <ActivateRelations trigger="mouseenter" />
    <BrushSelect />
    <ClickSelect />
    <FontPaint />
    <ZoomCanvas />
    <DragCanvas />
    <DragCombo />
    <DragNode />
    <Hoverable />
    <LassoSelect />
    <FitView />
    <MiniMap />
    <ContextMenu>
      <template #default="scope">
        <Menu @click="hendleContextMenuClick(scope, $event)">
          <MenuItem key="fishEye">鱼眼</MenuItem>
          <MenuItem key="1">item1</MenuItem>
          <MenuItem key="2">item2</MenuItem>
        </Menu>
      </template>
    </ContextMenu>
    <ContextMenu bindType="canvas">
      <template #default="scope">
        <Menu>
          <MenuItem key="hull" @click="handleChangeHull(scope, $event)">使用轮廓包裹</MenuItem>
        </Menu>
      </template>
    </ContextMenu>
    <FishEye v-if="fishEyeVisible" :handleEscListener="handleEscListener" />
    <Hull :options="hullOptions" />
    <SnapLine :options="snaplineOptions" :visible="true" />
    <Tooltip bindType="node" placement="right" :hasArrow="true">
      <template #default="scope">
        <div>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
        </div>
      </template>
    </Tooltip>
    <Legend bindType="node" sortKey="data.type">
      <template #default="scope">
        <LegendNode :options="scope.options" :dataMap="scope.dataMap">
          <template #default="legend">
            <span class="dot" :style="`background: ${legend.dotColor}`" />
            <span class="label" :style="`color: ${legend.labelColor}`">
              {{legend.label}}({{legend.data.length}})
            </span>
          </template>
        </LegendNode>
      </template>
    </Legend>
    <!-- <TreeCollapse /> -->
    <!-- <DragNodeWithForce /> -->
  </Graphin>
</template>
<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue'
import { Options, Vue as Component } from 'vue-class-component';
import { Menu } from 'ant-design-vue';
import 'ant-design-vue/es/menu/style/css'
import Utils from '@antv/graphin/es/utils'
import iconsLoader from '@antv/graphin-icons';
import '@antv/graphin-icons/dist/index.css';
// import ZoomCanvas from './behaviors/ZoomCanvas'
// import FitView from './behaviors/FitView'
// import FontPaint from './behaviors/FontPaint'
// import ActivateRelations from './behaviors/ActivateRelations'
// import BrushSelect from './behaviors/BrushSelect'
// import ClickSelect from './behaviors/ClickSelect'
// import DragCanvas from './behaviors/DragCanvas'
// import DragCombo from './behaviors/DragCombo'
// import DragNode from './behaviors/DragNode'
// import Hoverable from './behaviors/Hoverable'
// import LassoSelect from './behaviors/LassoSelect'
// import TreeCollapse from './behaviors/TreeCollapse'
// import DragNodeWithForce from './behaviors/DragNodeWithForce'

// import Graphin from './Graphin'
// import Behaviors from './behaviors'
// import Graphin, { Behaviors } from '../dist/index.es'
import Graphin, { Behaviors, Components, registerFontFamily } from './index'
const {
  /** 内置 */
  DragCanvas,
  ZoomCanvas,
  ClickSelect,
  BrushSelect,
  DragNode,
  // ResizeCanvas,
  LassoSelect,
  DragCombo,
  Hoverable,
  /** 可选 */
  ActivateRelations,
  TreeCollapse,
  FitView,
  FontPaint,
  DragNodeWithForce,
} = Behaviors;

const {
  /** 内置组件 */
  MiniMap,
  ContextMenu,
  FishEye,
  Hull,
  SnapLine,
  Tooltip,
  Legend,
} = Components;

const MenuItem = Menu.Item
const LegendNode = Legend.Node

const icons = registerFontFamily(iconsLoader);
const Color = {
  company: {
    primaryColor: '#ffc107',
  },
  person: {
    primaryColor: '#28a52d',
  },
};

@Options({
  components: {
    Graphin,
    ZoomCanvas,
    FitView,
    FontPaint,
    ActivateRelations,
    BrushSelect,
    ClickSelect,
    DragCanvas,
    DragCombo,
    DragNode,
    Hoverable,
    LassoSelect,
    TreeCollapse,
    DragNodeWithForce,
    MiniMap,
    ContextMenu,
    Menu, MenuItem,
    FishEye,
    Hull,
    SnapLine,
    Tooltip,
    Legend, LegendNode,
  },
})
export default class App extends Component {

  name = 'world'
  data = {nodes: [], edeges: []}
  layout = {
    type: 'graphin-force',
    preset: {
      type: 'grid',
    }
  }
  hullOptions = [
    {
      members: ['node-1', 'node-2'], // 必须参数
    },
    {
      members: ['node-3', 'node-4'],
      type: 'bubble',
      padding: 10,
      style: {
        fill: 'lightgreen',
        stroke: 'green',
      },
    },
  ]
  snaplineOptions = {
    line: {
      stroke: 'lightgreen',
      lineWidth: 0.5,
    },
  }
  fishEyeVisible = false

  hendleContextMenuClick(data, event) {
    const { onClose } = data
    console.log('hendleContextMenuClick', data, event)
    onClose && onClose()
    if (event.key == 'fishEye') {
      this.fishEyeVisible = true
    }
  }

  handleChangeHull(data, event) {
    const { selectedItems={}, onClose } = data
    const nodes = selectedItems.nodes || [];
    if (nodes.length) {
      const members = nodes.map((item: any) => {
        return item.get('id');
      }) as string[];
      const newHullOptions = {
        members,
        type: 'bubble',
        padding: 10,
        style: {
          fill: 'lightgreen',
          stroke: 'green',
        },
      };
      this.hullOptions = [{...newHullOptions}]
    }
    onClose && onClose()
  }

  handleEscListener(ev) {
    this.fishEyeVisible = false
  }

  processNode() {
    this.data.nodes.forEach((node, index) => {
      const isCompany = index % 3 === 0;
      const iconType = isCompany ? 'company' : 'person';
      node.data = {
        type: iconType,
      };
      node.type = 'graphin-circle';
      const { primaryColor } = Color[iconType];
      node.style = {
        keyshape: {
          size: 30,
          stroke: primaryColor,
          fill: primaryColor,
          fillOpacity: 0.2,
        },
        icon: {
          type: 'font',
          fontFamily: 'graphin',
          value: isCompany ? icons.company : icons.user,
          size: 14,
          fill: primaryColor,
        },
      };
    });
  }

  created() {

    setTimeout(() => this.name = 'lloyd', 2000)
    console.log('created', this)
    // @ts-ignore
    this.data = Utils.mock(8).circle().graphin()
    this.processNode()
    setTimeout(() => {
      // @ts-ignore
      this.data = Utils.mock(10).circle().graphin()
      this.processNode()
      console.log('update data', this.data)
    }, 3000)
    // setTimeout(() => {
    //   // @ts-ignore
    //   this.data = Utils.mock(100).circle().graphin()
    //   console.log('update data', this.data)
    // }, 10000)
  }

}
</script>

<style>
#app{
  width: 98vw;
  height: 98vh;
}
</style>
