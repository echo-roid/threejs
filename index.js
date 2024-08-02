function animationsfortext() {
    document.getElementsByClassName("contents")[0].style.height = "100%";
}
setTimeout(() => {
    animationsfortext();
}, 1000);



document.addEventListener("DOMContentLoaded", () => {
    const starsScene = new THREE.Scene();
    const coinScene = new THREE.Scene();
  
    // Stars Renderer
    const starsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const starsContainer = document.getElementById('stars-container');
    starsRenderer.setSize(starsContainer.clientWidth, starsContainer.clientHeight);
    starsContainer.appendChild(starsRenderer.domElement);
  
    // Coin Renderer
    const coinRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const coinContainer = document.getElementById('coin-container');
    coinRenderer.setSize(coinContainer.clientWidth, coinContainer.clientHeight);
    coinContainer.appendChild(coinRenderer.domElement);
  
    const camera = new THREE.PerspectiveCamera(75, coinContainer.clientWidth / coinContainer.clientHeight, 0.1, 1000);
  
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, -18, 10);
    coinScene.add(light);
  
    const loader = new THREE.OBJLoader();
    let coin;
  
    loader.load('BITCOIN.obj', (object) => {
      const vertices = [];
      object.traverse((child) => {
        if (child.isMesh) {
          const positions = child.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            vertices.push(positions[i], positions[i + 1], positions[i + 2]);
          }
        }
      });
  
      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const pointMaterial = new THREE.PointsMaterial({ color: 0xffd700, size: Math.random() * 0.1 + 0.005 });
  
      coin = new THREE.Points(pointGeometry, pointMaterial);
      coinScene.add(coin);
  
      coin.position.set(1000, -1000, 0);
      coin.rotation.set(0, 0, 0);
      coin.scale.set(2, 2,2);
  
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffd700) },
          time: { value: 0 },
        },
        vertexShader: `
          uniform float time;
          varying vec3 vColor;
          void main() {
            vColor = vec3(1.0, 0.843, 0); // Gold color
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float twinkle = sin(time + position.x * 10.0) * 0.5 + 0.5;
            gl_PointSize = (0.2 + twinkle * 0.1) * (300.0 / -mvPosition.z); // Adjust point size based on distance and twinkle
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        transparent: true,
      });
  
      const starCount = 5000;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 200; // Widen the starfield
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
  
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      starsScene.add(stars);
  
      // Animation to center
      const targetPosition = { x: 0, y: -1 };
      gsap.to(coin.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        duration: 3.5,
        ease: "power2.out",
      });
  
      gsap.to(stars.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        duration: 3.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(stars.rotation, { y: Math.PI * 1.25, duration: 20, ease: "none", repeat: -1 });
        }
      });
  
      gsap.to(coin.rotation, { y: Math.PI * 1.25, duration: 20, ease: "none", repeat: -1 });
  
      let twinkling = false;
      let rotateDirection = 1;
      coinContainer.addEventListener('click', () => {
        twinkling=!twinkling;
        rotateDirection *= -1;
        gsap.to(stars.rotation, { y: `+=${Math.PI * 1.25 * rotateDirection}`, duration: 20, ease: "none", repeat: -1 });
        gsap.to(coin.rotation, { y: `+=${Math.PI * 1.25 * rotateDirection}`, duration: 20, ease: "none", repeat: -1 });
      });
    });
  
    camera.position.z = 35;
  
    const animate = () => {
      requestAnimationFrame(animate);
      starsRenderer.render(starsScene, camera);
      coinRenderer.render(coinScene, camera);
  
      if (twinkling) {
        starsScene.children.forEach(child => {
          if (child.isPoints) {
            child.material.uniforms.time.value += 0.5;
          }
        });
      }
    };
  
    animate();
  
    window.addEventListener('resize', () => {
      camera.aspect = coinContainer.clientWidth / coinContainer.clientHeight;
      camera.updateProjectionMatrix();
      coinRenderer.setSize(coinContainer.clientWidth, coinContainer.clientHeight);
    });
  });
  