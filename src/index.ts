/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*
 * @Author: lzy-Jerry
 * @Date: 2023-05-02 20:12:11
 * @LastEditors: lzy-Jerry
 * @LastEditTime: 2023-05-18 19:37:28
 * @Description:
 */

interface Options {
    bgColor?: string;
    lineWidth?: number;
    color?: string;
    type?: string;
    quality?: number;
  }
  
  interface Points {
    x: number
    y: number
  }
  
  const enum initOptions {
    bgColor = '#fff',
    lineWidth = 5,
    color = '#000',
    type = 'image/png',
    quality = 0.92
  }
  
  class Signature {
    private canvas: HTMLCanvasElement
    private ctx:CanvasRenderingContext2D
    private paintPoints: Points = { x: 0, y: 0 }
    private isDrawing = false
    private options: Options = {}
  
    constructor(canvas: HTMLCanvasElement, options?: Options) {
      this.canvas = canvas
      this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      this.initCanvas() // 抗锯齿优化
      this.init(options)
    }
  
    private initCanvas() {
      const scale = this.getCanvasSacle()
      const width = this.canvas.offsetWidth
      const height = this.canvas.offsetHeight
      this.canvas.width = width * scale // 放大画布
      this.canvas.height = height * scale // 放大画布
      this.canvas.style.width = width + 'px' // 通过css将画板调整为原来大小
      this.canvas.style.height = height + 'px'
      this.ctx.scale(scale, scale) // 增大画笔像素
    }
  
    private init( options?: Options) {
      this.options.bgColor = options?.bgColor || initOptions.bgColor
      this.options.lineWidth = options?.lineWidth || initOptions.lineWidth
      this.options.color = options?.color || initOptions.color
      this.options.type = options?.type || initOptions.type
      this.options.quality = options?.quality || initOptions.quality
      this.eventListener()
    }
  
    public isMobile = () => {
      return 'ontouchstart' in window || !!window.orientation
    }
  
    // 获取设备像素比
    public getCanvasSacle() {
      const ratio = 'devicePixelRatio'
      return ratio in window ? window[ratio] : 1
    }
  
    // 兼容pc & 移动端获取位置
    private getCurrentPosition = (e: TouchEvent | MouseEvent) => {
      let x = 0
      let y = 0
      if(e instanceof TouchEvent) {
        const { clientX, clientY } = e.touches[0]
        const { left, top } = this.canvas.getClientRects()[0]
        x = clientX - left
        y = clientY - top
      } else {
        x = e.offsetX
        y = e.offsetY
      }
      return { x, y }
    }
  
    // 监听事件
    private eventListener() {
      if(this.isMobile()) {
        this.canvas.addEventListener("touchstart", this.onPaintDown)
        this.canvas.addEventListener("touchmove", this.onPaintMove)
        this.canvas.addEventListener("touchcancel", this.onPaintUp)
      } else {
        this.canvas.addEventListener("mousedown", this.onPaintDown)
        this.canvas.addEventListener("mousemove", this.onPaintMove)
        document.addEventListener("mouseup", this.onPaintUp)
      }
  
    }
  
    // 绘制时画笔的样式
    private setPaintStyle = (): void => {
      this.ctx.lineWidth = this.options.lineWidth! // 画笔粗细
      this.ctx.lineCap = "round" // 画笔末端形状
      this.ctx.lineJoin = "round" // 画笔折点形状
      this.ctx.strokeStyle = this.options.color! // 直线颜色
    }
  
    private onPaintDown = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault()
      const { x, y } = this.getCurrentPosition(e)
      this.paintPoints.x = x
      this.paintPoints.y = y
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
      this.ctx.lineTo(x, y)
      this.setPaintStyle()
      this.ctx.stroke()
      this.ctx.closePath()
      this.isDrawing = true
    }
  
    private onPaintMove = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault()
      if(!this.isDrawing) return
      const { x, y } = this.getCurrentPosition(e)
      this.ctx.beginPath()
      this.ctx.moveTo(this.paintPoints.x, this.paintPoints.y) // 上一次路径的最后位置
      this.ctx.lineTo(x, y) // 移动到最新的鼠标的位置
      this.ctx.stroke()
      this.ctx.closePath()
      this.paintPoints.x = x // 重置上一次的位置
      this.paintPoints.y = y
    }
  
    private onPaintUp = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault()
      this.isDrawing = false
    }
  
    private drawBackground = ():void => {
      const width = this.canvas.offsetWidth
      const height = this.canvas.offsetHeight
      this.ctx.fillStyle = this.options.bgColor!
      this.ctx.fillRect(0,0, width, height)
    }
  
    public clear = ():void => {
      this.drawBackground()
    }
  
    public generateBase64 = (width?: number, height?: number): string => {
      const _canvas = document.createElement("canvas")
      const _ctx = _canvas.getContext("2d")!
      const _width = width ||  this.canvas.offsetWidth
      const _height = height ||  this.canvas.offsetHeight
      _canvas.width = _width // 指定画布宽高
      _canvas.height = _height
      _ctx.fillStyle = this.options.bgColor!
      _ctx.fillRect(0,0, _width, _height) // 生成画布背景
      _ctx.drawImage(this.canvas, 0, 0, _width, _height) // drawImage 会根据设置的width和height自动根据比例缩放画到画布上
      return _canvas.toDataURL(this.options.type, this.options.quality)
    }
  }
  export default Signature
  