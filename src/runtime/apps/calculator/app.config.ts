export default {
  id: 'org.owdproject.calculator',
  title: 'Calculator',
  category: 'accessories',
  singleton: true,
  icon: 'mdi:calculator-variant',
  provides: {
    name: 'calculator',
    entry: 'calculator',
  },
  windows: {
    main: {
      component: () => import('./components/Window/WindowCalculator.vue'),
      resizable: false,
      size: {
        width: 282,
        height: 330,
      },
      position: {
        x: 320,
        y: 180,
        z: 0,
      },
    },
  },
  entries: {
    calculator: {
      command: 'calculator',
    },
  },
  commands: {
    calculator: (app: IApplicationController) => {
      const existing = app.getFirstWindowByModel('main')
      if (existing) {
        existing.actions.setActive(true)
        existing.actions.bringToFront()
        return existing
      }

      return app.openWindow('main')
    },
  },
}
