<template>
  <div class="warn" role="note">
    <span class="warn-icon"><AppIcon name="alert" /></span>
    <p><slot /></p>
  </div>
</template>

<style scoped>
.warn {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 22px;
  border: 1.5px solid var(--red); border-radius: 10px;
  background: #fdf6f5;
}
.warn-icon { color: var(--red); flex: none; }
.warn-icon svg { width: 34px; height: 34px; }
.warn p { color: var(--red); font-family: var(--font-head); font-size: 19px; font-weight: 700; line-height: 1.3; }
</style>
