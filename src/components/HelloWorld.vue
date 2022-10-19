<template>
  <div id="container"></div>
  <div></div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      map: null,
      polyline: null,
      timer: null,
      points: [],
      T: 0
    }
  },
  mounted() {
    this.map = new this.$BMapGL.Map("container")

    const point = new this.$BMapGL.Point(116.403119, 39.914271);
    this.map.centerAndZoom(point, 14)
    this.map.enableScrollWheelZoom(true)
    this.map.setHeading(40);   //设置地图旋转角度
    this.map.setTilt(45);       //设置地图的倾斜角度

    const scaleCtrl = new this.$BMapGL.ScaleControl();  // 添加比例尺控件
    this.map.addControl(scaleCtrl);
    const zoomCtrl = new this.$BMapGL.ZoomControl();  // 添加缩放控件
    this.map.addControl(zoomCtrl);
    const cityCtrl = new this.$BMapGL.CityListControl();  // 添加城市列表控件
    this.map.addControl(cityCtrl);

    let _this = this
    this.map.addEventListener('click', function (e) {
      _this.points.push([e.latlng.lng, e.latlng.lat])
      _this.map.addOverlay(new _this.$BMapGL.Marker(new _this.$BMapGL.Point(e.latlng.lng, e.latlng.lat)))
    })

    const txtMenuItem = [
      {
        text: '运行',
        callback: () => {
          this.renderMarker()
          this.T = 10.0 * this.points.length
          if (this.timer) {
            clearInterval(this.timer)
          }
          this.timer = setInterval(this.optimize, 100)
        }
      }
    ];
    const menu = new this.$BMapGL.ContextMenu();
    for (let i = 0; i < txtMenuItem.length; i++) {
      menu.addItem(new this.$BMapGL.MenuItem(
              txtMenuItem[i].text,
              txtMenuItem[i].callback,
              {
                width: 300,
                id: 'menu' + i
              }
          )
      )
    }
    this.map.addContextMenu(menu);
  },
  methods: {
    render() {
      let map1 = this.points.map(value => {
        return new this.$BMapGL.Point(value[0], value[1])
      });
      map1.push(new this.$BMapGL.Point(this.points[0][0], this.points[0][1]))

      this.polyline = new this.$BMapGL.Polyline(
          map1,
          {strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5}
      )
      this.map.addOverlay(this.polyline)
    },
    renderMarker() {
      for (var pointi of this.points) {
        this.map.addOverlay(new this.$BMapGL.Marker(new this.$BMapGL.Point(pointi[0], pointi[1])))
      }
    },
    clear() {
      this.map.removeOverlay(this.polyline)
    },
    optimize() {

      const n = this.points.length;
      const L = 100
      const K = 0.99

      if (this.T > 0.0001) {
        for (let i = 0; i < L; i++) {
          let len1 = this.lengthSum(this.points)

          let p1 = Math.floor(Math.random() * n)
          let p2 = Math.floor(Math.random() * n)
          while (p1 === p2) {
            p1 = Math.floor(Math.random() * n)
            p2 = Math.floor(Math.random() * n)
          }
          let temp_points = [...this.points]
          let temp1 = temp_points[p1]
          // let temp2 = temp_points[p2]
          // temp_points[p1] = temp_points[p2]
          // temp_points[p2] = temp
          temp_points.splice(p1, 1)
          temp_points.splice(p2, 0, temp1)
          let len2 = this.lengthSum(temp_points)

          let delta_e = len2 - len1
          if (delta_e < 0) {
            this.points = [...temp_points]
          } else {
            if (Math.exp(-delta_e / this.T) > Math.random()) {
              this.points = [...temp_points]
            }
          }
        }
        this.T = this.T * K
      } else {
        if (this.timer) {
          clearInterval(this.timer)
        }
      }
      this.clear()
      this.render()
      // console.log(this.lengthSum(this.points))
      // console.log(this.T)
    },
    lengthSum(points) {
      let len = 0;
      const n = points.length;
      for (let i = 0; i < n - 1; i++) {
        len += Math.sqrt(Math.pow(points[i][0] - points[i + 1][0], 2) + Math.pow(points[i][1] - points[i + 1][1], 2))
      }
      len += Math.sqrt(Math.pow(points[n - 1][0] - points[0][0], 2) + Math.pow(points[n - 1][1] - points[0][1], 2))
      return len
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#container {
  height: 100%;
}
</style>
