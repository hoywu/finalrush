<script setup lang="ts">
const route = useRoute();
const navList = [
  { route: 'data', name: '数据' },
  { route: 'do', name: '做题' },
  { route: 'import', name: '导入' },
  { route: 'setting', name: '设置' },
];
</script>

<template>
  <div id="header-wrapper">
    <header>
      <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" /> -->

      <nav>
        <RouterLink
          v-for="nav in navList"
          :key="nav.route"
          :to="{ name: nav.route }"
          :class="{ active: route.name === nav.route }"
        >
          {{ nav.name }}
        </RouterLink>
      </nav>
    </header>
  </div>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
/*** Header ***/
#header-wrapper {
  background-color: var(--neutral-100);
  box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.1);
}

header {
  @apply flex items-center gap-5 my-0 mx-auto px-4 py-2;
}

.logo {
  width: 30px;
  height: 30px;
}

/*** Navigation ***/
nav {
  @apply flex gap-2;
}

nav > * {
  text-decoration: none;
  color: var(--neutral-700);
  padding: 5px 10px;
  border-bottom: 2px solid transparent;

  transition: all 0.2s ease-in-out;
}

nav > *:hover {
  color: var(--primary-500);
}

nav > .active {
  color: var(--primary-500);
  border-bottom: 2px solid var(--primary-500);
}

/*** Main ***/
main {
  margin: 20px 1%;
  padding: 0 20px;
}
</style>
