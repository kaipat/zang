const Zang = require("./zangCreator");
const { icon } = require("./hearts");
Component({
  properties: {
    width: {
      type: Number,
      value: 80
    },
    height: {
      type: Number,
      value: 80
    }
  },

  data: {
    zang: '',
    icon: icon,
  },

  methods: {
    init() {
      if (!this.data.zang) {
        this.data.zang = new Zang(this);
        console.log(this.data.zang);
      };
    },
    click() {
      this.data.zang.handleZang();
    },
  }
})



