const undef = void 0,
      m = new Map;
$(window)
    .on('keydown keyup', ({key, type}) => m.set(key, type === 'keydown'))
    .on('touchstart touchend', ({type}) => m.set(undef, type === 'touchstart'))
    .on('blur contextmenu mouseleave', () => m.clear());
export const isKeyDown = arr => arr.some(v => m.get(v));
