import { cubicInOut, quintOut } from 'svelte/easing';

// Transition personalizada para elementos que entram na tela durante a rolagem
export function pageTransition(node: HTMLElement, {
  delay = 0,
  duration = 800,
  easing = cubicInOut
} = {}) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;
  
  return {
    delay,
    duration,
    css: (t: number, u: number) => `
      opacity: ${t * opacity};
      transform: ${transform} translateY(${u * 40}px);
    `,
    easing
  };
}

// Transição para elementos que aparecem de forma escalonada (cascata)
export function staggered(node: HTMLElement, {
  delay = 0,
  duration = 500,
  index = 0,
  staggerTime = 100,
  easing = quintOut
} = {}) {
  return {
    delay: delay + (index * staggerTime),
    duration,
    easing,
    css: (t: number) => `
      opacity: ${t};
      transform: translateY(${(1-t) * 20}px);
    `
  };
}

// Transição suave tipo "desaparecer" para objetos 3D
export function fadeObjectOpacity(object: THREE.Object3D, {
  from = 0,
  to = 1,
  duration = 1000
} = {}) {
  const startTime = Date.now();
  
  return {
    update: () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = cubicInOut(progress);
      const currentOpacity = from + (to - from) * t;
      
      if (object.type === 'Mesh' && (object as THREE.Mesh).material) {
        const material = (object as THREE.Mesh).material as THREE.Material;
        if (!material.transparent) {
          material.transparent = true;
        }
        material.opacity = currentOpacity;
      }
      
      return progress < 1;
    }
  };
}
