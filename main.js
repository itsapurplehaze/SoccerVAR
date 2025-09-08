AFRAME.registerComponent('smooth-follow', {
  schema: {
    lerpFactor: {type: 'number', default: 0.2}
  },
  tick: function () {
    const target = this.el.parentEl.object3D;
    const current = this.el.object3D;

    current.position.lerp(target.position, this.data.lerpFactor);
    current.quaternion.slerp(target.quaternion, this.data.lerpFactor);
  }
});
