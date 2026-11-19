/**
 * Demo components, registered by name. A project opts in with `media.demo: '<name>'` in
 * src/data/projects.js. To add a demo: create src/components/<name>Demo.js exporting
 * `render(data?, uid?) → string` (static, build-time HTML) and `mount(rootEl)` (client
 * enhancement), then add it below. No section/layout code needs to change.
 */
import * as promptDefense from './promptDefenseDemo.js';
import * as legalRisk from './legalRiskDemo.js';

export const demos = {
  promptDefense,
  legalRisk,
};
