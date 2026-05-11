/**
 * Default Category Tools
 * Core diagnostic and information tools
 */

export { getStatusDefinition, getStatusTool } from "./get_status";
export { getInfoDefinition, getInfoTool } from "./get_info";
export { getConfigDefinition, getConfigTool } from "./get_config";
export { validateTokenDefinition, validateTokenTool } from "./validate_token";
export { testConnectionDefinition, testConnectionTool } from "./test_connection";

import { getStatusDefinition, getStatusTool } from "./get_status";
import { getInfoDefinition, getInfoTool } from "./get_info";
import { getConfigDefinition, getConfigTool } from "./get_config";
import { validateTokenDefinition, validateTokenTool } from "./validate_token";
import { testConnectionDefinition, testConnectionTool } from "./test_connection";

/**
 * All default category tools
 */
export const defaultTools = [
  { definition: getStatusDefinition, handler: getStatusTool },
  { definition: getInfoDefinition, handler: getInfoTool },
  { definition: getConfigDefinition, handler: getConfigTool },
  { definition: validateTokenDefinition, handler: validateTokenTool },
  { definition: testConnectionDefinition, handler: testConnectionTool },
];
