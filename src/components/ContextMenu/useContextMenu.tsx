import { onMounted, onUnmounted, toRefs, reactive } from 'vue'
import { IG6GraphEvent } from '@antv/g6'
import { useContext } from '../../GraphinContext';
import useState from '../../state'

export interface ContextMenuProps {
  bindType?: 'node' | 'edge' | 'canvas';
  bindEvent?: 'click' | 'contextmenu';
  // container: React.RefObject<HTMLDivElement>;
  container: any;  // ref
}

export interface State {
  /** 当前状态 */
  visible: boolean;
  x: number;
  y: number;
  /** 触发的元素 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: IG6GraphEvent['item'];
  /** 只有绑定canvas的时候才触发 */
  selectedItems: IG6GraphEvent['item'][];
}

export const usePotision = (props: any) => {
  // @ts-ignore
  const { container, graph, e } = props
  const width: number = graph.get('width');
  const height: number = graph.get('height');
  if (!container.value) {
    return;
  }

  const bbox = container.value.getBoundingClientRect();

  const offsetX = graph.get('offsetX') || 0;
  const offsetY = graph.get('offsetY') || 0;

  const graphTop = graph.getContainer().offsetTop;
  const graphLeft = graph.getContainer().offsetLeft;

  let x = e.canvasX + graphLeft + offsetX;
  let y = e.canvasY + graphTop + offsetY;

  // when the menu is (part of) out of the canvas

  if (x + bbox.width > width) {
    x = e.canvasX - bbox.width - offsetX + graphLeft;
  }
  if (y + bbox.height > height) {
    y = e.canvasY - bbox.height - offsetY + graphTop;
  }
  return { x, y }
}


const useContextMenu = (props: ContextMenuProps) => {
  const { bindType = 'node', bindEvent='contextmenu', container } = props;
  // @ts-ignore
  const { graph } = useContext();

  const [state, setState] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    selectedItems: [],
  } as State)

  const handleShow = (e: IG6GraphEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // @ts-ignore
    let { x, y } = usePotision({ container, e, graph })

    if (bindType === 'node') {
      // 如果是节点，则x，y指定到节点的中心点
      // eslint-disable-next-line no-underscore-dangle
      const { x: PointX, y: PointY } = (e.item && e.item.getModel()) as { x: number; y: number };
      const CenterCanvas = graph.getCanvasByPoint(PointX, PointY);

      const daltX = e.canvasX - CenterCanvas.x;
      const daltY = e.canvasY - CenterCanvas.y;
      x = x - daltX;
      y = y - daltY;
    }

    /** 设置变量 */
    setState((preState: State) => {
      return {
        ...preState,
        visible: true,
        x,
        y,
        item: e.item,
      };
    })
  };
  const handleClose = () => {
    setState((preState: State) => {
      if (preState.visible) {
        return {
          ...preState,
          visible: false,
          x: 0,
          y: 0,
        };
      }
      return preState;
    })
  };

  const handleSaveAllItem = (e: IG6GraphEvent) => {
    setState((preState: State) => {
      return {
        ...preState,
        selectedItems: e.selectedItems as IG6GraphEvent['item'][],
      };
    });
  }

  onMounted(() => {
    // @ts-ignore
    graph.on(`${bindType}:${bindEvent}`, handleShow);
    // 如果是左键菜单，可能导致和canvans的click冲突
    if (!(bindType == 'canvas' && bindEvent == 'click')) {
      graph.on('canvas:click', handleClose);
    }
    graph.on('canvas:drag', handleClose);
    graph.on('wheelzoom', handleClose);
    if (bindType === 'canvas') {
      graph.on('nodeselectchange', handleSaveAllItem);
    }
  })
  onUnmounted(() => {
    // @ts-ignore
    graph.off(`${bindType}:${bindEvent}`, handleShow);
    graph.off('canvas:click', handleClose);
    graph.off('canvas:drag', handleClose);
    graph.off('wheelzoom', handleClose);
    graph.off('nodeselectchange', handleSaveAllItem);
  })

  return {
    ...toRefs(state),
    oneShow: handleShow,
    onClose: handleClose,
  };
};

export default useContextMenu;
