     (function () {
      const TOTAL_FRAMES = 180;
      const FRAME_PATH_PREFIX = './ezgif-72843d57ac70b076-png-split/ezgif-frame-';
      const FRAME_PATH_SUFFIX = '.png';

      const canvas = document.getElementById('animation-canvas');
      const ctx = canvas.getContext('2d');
      const loader = document.getElementById('loader');
      const loaderText = document.getElementById('loader-text');
      const loaderFill = document.getElementById('loader-fill');

      const images = [];
      let loadedCount = 0;

      let targetFrame = 0;
      let currentFrame = 0;

      function getFrameFilename(index) {
        const paddedIndex = String(index).padStart(3, '0');
        return `${FRAME_PATH_PREFIX}${paddedIndex}${FRAME_PATH_SUFFIX}`;
      }

      function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(dpr, dpr);
        renderCurrentFrame();
      }

      function drawFrame(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Cover fit: fill 100% of the screen background on all devices including large & ultrawide displays
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        const x = (canvasWidth - drawWidth) / 2;
        // Top-aligned with subtle offset so top subject is fully complete and unclipped
        const y = (drawHeight > canvasHeight) ? 0 : (canvasHeight - drawHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }

      function renderCurrentFrame() {
        const roundedIndex = Math.round(currentFrame);
        const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, roundedIndex));
        if (images[clampedIndex]) {
          drawFrame(images[clampedIndex]);
        }
      }

      function updateScrollProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        if (maxScroll <= 0) return;

        const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
        targetFrame = progress * (TOTAL_FRAMES - 1);
      }

      function tick() {
        const diff = targetFrame - currentFrame;
        
        if (Math.abs(diff) > 0.001) {
          currentFrame += diff * 0.12;
          renderCurrentFrame();
        } else if (currentFrame !== targetFrame) {
          currentFrame = targetFrame;
          renderCurrentFrame();
        }

        requestAnimationFrame(tick);
      }

      function preloadImages() {
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
          const img = new Image();
          const src = getFrameFilename(i);

          img.onload = () => {
            loadedCount++;
            const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
            loaderText.textContent = `Loading ${percent}%`;
            loaderFill.style.width = `${percent}%`;

            if (i === 1) {
              drawFrame(img);
            }

            if (loadedCount === TOTAL_FRAMES) {
              onAllLoaded();
            }
          };

          img.onerror = () => {
            loadedCount++;
            if (loadedCount === TOTAL_FRAMES) {
              onAllLoaded();
            }
          };

          img.src = src;
          images.push(img);
        }
      }

      function onAllLoaded() {
        setTimeout(() => {
          loader.classList.add('hidden');
        }, 200);

        updateScrollProgress();
        tick();
      }

      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('orientationchange', resizeCanvas);
      window.addEventListener('scroll', updateScrollProgress, { passive: true });

      resizeCanvas();
      preloadImages();
    })();
 