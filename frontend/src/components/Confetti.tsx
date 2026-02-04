import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  // First burst - center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4a7c59', '#e07b39', '#8fbc8f', '#ffd700', '#ff69b4'],
  });

  // Second burst - left side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#4a7c59', '#e07b39', '#ffd700'],
    });
  }, 150);

  // Third burst - right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#4a7c59', '#e07b39', '#ffd700'],
    });
  }, 300);
};

// Celebration with stars and circles
export const triggerCelebration = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4a7c59', '#e07b39', '#8fbc8f'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4a7c59', '#e07b39', '#8fbc8f'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

// Milk drop themed confetti
export const triggerMilkConfetti = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ffffff', '#f0f0f0', '#e8e8e8', '#4a7c59', '#e07b39'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['circle'],
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 2,
    shapes: ['circle'],
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 35,
      scalar: 1.5,
      shapes: ['circle'],
    });
  }, 200);
};
