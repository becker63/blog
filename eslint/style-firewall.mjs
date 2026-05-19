import path from "node:path";

const COLOR_PATTERN = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\(|hsla?\(/i;
const BOX_SHADOW_PATTERN = /(rgba?\(|\d(px|rem|em|%)|\ddeg)/i;
const RADIUS_UNIT_PATTERN = /(px|rem|em|%)\b/i;

const GEOMETRY_KEYS = new Set(["left", "top", "transform", "width", "height"]);
const COLOR_PROPS = new Set([
  "background",
  "backgroundColor",
  "borderColor",
  "color",
  "fill",
  "stroke",
]);
const SURFACE_PROPS = new Set([
  "background",
  "backgroundColor",
  "backdropFilter",
  "boxShadow",
  "border",
  "borderColor",
]);
const STYLING_PROPS = new Set([
  "background",
  "backgroundColor",
  "backdropFilter",
  "bg",
  "border",
  "borderColor",
  "borderRadius",
  "boxShadow",
  "className",
  "color",
  "layerStyle",
  "style",
]);

const DEFAULT_ALLOW_STYLING = [
  "src/components/ui",
  "src/theme",
  "src/theme/recipes",
  "src/styled-system",
];
const DEFAULT_ALLOW_SURFACE = ["src/theme", "src/components/ui"];

function normalizeFileName(filename) {
  if (!filename || filename === "<input>") return "";
  return path.normalize(filename);
}

function isInAllowedPath(filename, allowList) {
  const normalized = normalizeFileName(filename);
  return allowList.some((entry) => normalized.includes(path.normalize(entry)));
}

function getAttrName(attribute) {
  if (!attribute || !attribute.name) return null;
  if (attribute.name.type === "JSXIdentifier") return attribute.name.name;
  if (attribute.name.type === "JSXNamespacedName")
    return `${attribute.name.namespace.name}:${attribute.name.name.name}`;
  return null;
}

function getPropertyName(property) {
  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "Literal") return String(property.key.value);
  return null;
}

function getLiteralText(node) {
  if (!node) return null;
  if (node.type === "Literal") {
    if (typeof node.value === "string" || typeof node.value === "number") {
      return String(node.value);
    }
    return null;
  }
  if (node.type === "TemplateLiteral") {
    return node.quasis.map((q) => q.value.raw).join("");
  }
  return null;
}

function isMotionElement(openingElement) {
  const nameNode = openingElement?.name;
  if (!nameNode) return false;
  if (nameNode.type === "JSXMemberExpression") {
    return (
      nameNode.object.type === "JSXIdentifier" &&
      nameNode.object.name === "motion"
    );
  }
  if (nameNode.type === "JSXIdentifier") {
    return (
      nameNode.name.startsWith("motion.") || nameNode.name.startsWith("Motion")
    );
  }
  return false;
}

function getElementName(attribute) {
  const parent = attribute?.parent;
  if (parent?.type !== "JSXOpeningElement") return null;
  const nameNode = parent.name;
  if (nameNode.type === "JSXIdentifier") return nameNode.name;
  if (nameNode.type === "JSXMemberExpression" && nameNode.property.type === "JSXIdentifier") {
    return nameNode.property.name;
  }
  return null;
}

function getShallowStringLiteralProps(objectExpression) {
  const map = new Map();
  if (!objectExpression || objectExpression.type !== "ObjectExpression") {
    return map;
  }
  for (const prop of objectExpression.properties) {
    if (prop.type !== "Property" || prop.computed) continue;
    const keyName = getPropertyName(prop);
    if (!keyName || prop.value.type !== "Literal") continue;
    if (typeof prop.value.value !== "string") continue;
    map.set(keyName, prop.value.value);
  }
  return map;
}

function matchesDuplicatedPaneParentStack(objectExpression) {
  if (objectExpression.properties.some((p) => p.type === "SpreadElement")) {
    return false;
  }
  const m = getShallowStringLiteralProps(objectExpression);
  const gap = m.get("gap");
  return (
    m.get("display") === "flex" &&
    m.get("flexDirection") === "column" &&
    m.get("w") === "full" &&
    (gap === "6" || gap === "layout")
  );
}

function isFirstArgOfCssOrCssRawCall(objectExpression) {
  const parent = objectExpression.parent;
  if (parent?.type !== "CallExpression") return false;
  if (parent.arguments[0] !== objectExpression) return false;
  const callee = parent.callee;
  if (callee.type === "Identifier" && callee.name === "css") return true;
  if (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "css" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "raw"
  ) {
    return true;
  }
  return false;
}

function getEnclosingFunctionNode(node) {
  let n = node.parent;
  while (n) {
    if (
      n.type === "FunctionDeclaration" ||
      n.type === "FunctionExpression" ||
      n.type === "ArrowFunctionExpression"
    ) {
      return n;
    }
    n = n.parent;
  }
  return null;
}

function extractDefaultExportFunction(declaration) {
  if (!declaration) return null;
  if (declaration.type === "FunctionDeclaration") return declaration;
  if (declaration.type === "FunctionExpression" || declaration.type === "ArrowFunctionExpression") {
    return declaration;
  }
  if (declaration.type === "VariableDeclaration") {
    for (const d of declaration.declarations) {
      if (
        d.init &&
        (d.init.type === "ArrowFunctionExpression" || d.init.type === "FunctionExpression")
      ) {
        return d.init;
      }
    }
  }
  return null;
}

function isAdminPrivateAdminPageFile(filename) {
  const n = normalizeFileName(filename);
  return (
    n.includes(`${path.sep}app${path.sep}admin${path.sep}(private)${path.sep}`) &&
    n.endsWith(`${path.sep}page.tsx`)
  );
}

function isAdminAppPageTsx(filename) {
  const n = normalizeFileName(filename);
  return n.includes(`${path.sep}app${path.sep}admin${path.sep}`) && n.endsWith(`${path.sep}page.tsx`);
}

function isPandaCssImportSource(source) {
  if (!source || typeof source !== "string") return false;
  if (source === "@/styled-system/css") return true;
  if (source.endsWith("/styled-system/css")) return true;
  return source.includes(`${path.sep}styled-system${path.sep}css`) && !source.includes("node_modules");
}

function isDeprecatedDashboardShellImport(source) {
  if (!source || typeof source !== "string") return false;
  return source.includes("dashboard-shell");
}

function isInsideTokenDefinition(context, node) {
  const ancestors = context.sourceCode.getAncestors(node);
      return ancestors.some((ancestor) => {
        if (ancestor.type !== "CallExpression") return false;
        if (ancestor.callee.type === "Identifier") {
          return [
            "defineConfig",
            "defineTokens",
            "defineSemanticTokens",
            "defineLayerStyles",
            "defineRecipe",
      ].includes(ancestor.callee.name);
    }
    if (
      ancestor.callee.type === "MemberExpression" &&
      ancestor.callee.property.type === "Identifier"
    ) {
      const calleeObject =
        ancestor.callee.object.type === "Identifier"
          ? ancestor.callee.object.name
          : null;
      return (
        ["defineTokens", "defineSemanticTokens"].includes(
          ancestor.callee.property.name,
        ) ||
        ["defineTokens", "defineSemanticTokens"].includes(calleeObject)
      );
    }
    return false;
  });
}

const rules = {
  "no-inline-style-except-geometry": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Restrict inline styles to geometry keys unless using motion components.",
      },
      schema: [],
    },
    create(context) {
      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (name !== "style") return;

          const motionElement = isMotionElement(node.parent);
          const expression =
            node.value?.type === "JSXExpressionContainer"
              ? node.value.expression
              : null;

          if (expression?.type === "ObjectExpression") {
            const invalidKeys = [];
            for (const prop of expression.properties) {
              if (prop.type === "Property") {
                const keyName = getPropertyName(prop);
                if (keyName && !GEOMETRY_KEYS.has(keyName)) {
                  invalidKeys.push(keyName);
                }
              } else if (prop.type === "SpreadElement") {
                invalidKeys.push("spread");
              }
            }

            if (invalidKeys.length > 0 && !motionElement) {
              context.report({
                node,
                message: `Inline style only allows geometry keys (${[
                  ...GEOMETRY_KEYS,
                ].join(", ")}); found ${invalidKeys.join(", ")}.`,
              });
            }
            return;
          }

          if (!motionElement) {
            context.report({
              node,
              message:
                "Inline styles are limited to geometry keys (left, top, transform, width, height) or motion components.",
            });
          }
        },
      };
    },
  },

  "no-raw-colors": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow raw color literals; prefer design tokens.",
      },
      schema: [],
    },
    create(context) {
      function reportIfColor(valueNode) {
        if (isInsideTokenDefinition(context, valueNode)) return;
        const text = getLiteralText(valueNode);
        if (text && COLOR_PATTERN.test(text)) {
          context.report({
            node: valueNode,
            message: "Use design tokens instead of raw color values.",
          });
        }
      }

      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (!COLOR_PROPS.has(name)) return;
          const value = node.value;
          if (
            value?.type === "Literal" ||
            value?.type === "JSXExpressionContainer"
          ) {
            reportIfColor(
              value.type === "JSXExpressionContainer"
                ? value.expression
                : value,
            );
          }
        },
        Property(node) {
          const keyName = getPropertyName(node);
          if (!keyName || !COLOR_PROPS.has(keyName)) return;
          reportIfColor(node.value);
        },
      };
    },
  },

  "no-raw-box-shadow": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow raw box-shadow strings; prefer tokens.",
      },
      schema: [],
    },
    create(context) {
      function reportIfShadow(valueNode) {
        if (isInsideTokenDefinition(context, valueNode)) return;
        const text = getLiteralText(valueNode);
        if (text && BOX_SHADOW_PATTERN.test(text)) {
          context.report({
            node: valueNode,
            message:
              "Use shadow tokens (e.g. panel) instead of raw boxShadow values.",
          });
        }
      }

      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (name !== "boxShadow") return;
          const value = node.value;
          if (
            value?.type === "Literal" ||
            value?.type === "JSXExpressionContainer"
          ) {
            reportIfShadow(
              value.type === "JSXExpressionContainer"
                ? value.expression
                : value,
            );
          }
        },
        Property(node) {
          const keyName = getPropertyName(node);
          if (keyName !== "boxShadow") return;
          reportIfShadow(node.value);
        },
      };
    },
  },

  "no-raw-border-radius": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow raw border radius values; use radius tokens.",
      },
      schema: [],
    },
    create(context) {
      function reportIfRadius(valueNode) {
        if (isInsideTokenDefinition(context, valueNode)) return;
        const text = getLiteralText(valueNode);
        if (!text) return;
        if (RADIUS_UNIT_PATTERN.test(text) || /^\d+(\.\d+)?$/.test(text)) {
          context.report({
            node: valueNode,
            message:
              "Use radius tokens (l1–l4) instead of pixel/rem values for borderRadius.",
          });
        }
      }

      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (name !== "borderRadius") return;
          const value = node.value;
          if (
            value?.type === "Literal" ||
            value?.type === "JSXExpressionContainer"
          ) {
            reportIfRadius(
              value.type === "JSXExpressionContainer"
                ? value.expression
                : value,
            );
          }
        },
        Property(node) {
          const keyName = getPropertyName(node);
          if (keyName !== "borderRadius") return;
          reportIfRadius(node.value);
        },
      };
    },
  },

  "no-styling-outside-ui": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Restrict styling props and css() usage to UI primitives and recipes.",
      },
      schema: [
        {
          type: "object",
          properties: {
            allow: {
              type: "array",
              items: { type: "string" },
            },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      const allow =
        context.options[0]?.allow && context.options[0].allow.length > 0
          ? context.options[0].allow
          : DEFAULT_ALLOW_STYLING;
      const filename = context.getFilename();
      if (isInAllowedPath(filename, allow)) {
        return {};
      }

      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (!name || !STYLING_PROPS.has(name)) return;
          if (name === "className") return;
          if (isInsideTokenDefinition(context, node)) return;
          if (name === "style") {
            const expression =
              node.value?.type === "JSXExpressionContainer"
                ? node.value.expression
                : null;
            if (expression?.type === "ObjectExpression") {
              const hasNonGeometry = expression.properties.some((prop) => {
                if (prop.type !== "Property") return true;
                const keyName = getPropertyName(prop);
                return keyName && !GEOMETRY_KEYS.has(keyName);
              });
              if (!hasNonGeometry) {
                return;
              }
            }
          }
          const elementName = getElementName(node);
          if (elementName === "body" || elementName === "html") return;
          context.report({
            node,
            message:
              "Styling props belong in UI primitives or recipes. Move this styling into src/components/ui or theme recipes.",
          });
        },
        CallExpression(node) {
          if (node.callee.type === "Identifier" && node.callee.name === "css") {
            context.report({
              node,
              message:
                "css() styling is restricted to UI primitives and recipes. Lift this into a shared primitive.",
            });
          }
        },
      };
    },
  },

  "no-surface-props-outside-recipes": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Disallow surface styling props outside of recipes to avoid drift.",
      },
      schema: [
        {
          type: "object",
          properties: {
            allow: {
              type: "array",
              items: { type: "string" },
            },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      const allow =
        context.options[0]?.allow && context.options[0].allow.length > 0
          ? context.options[0].allow
          : DEFAULT_ALLOW_SURFACE;
      const filename = context.getFilename();
      if (isInAllowedPath(filename, allow)) {
        return {};
      }

      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (!name || !SURFACE_PROPS.has(name)) return;
          if (isInsideTokenDefinition(context, node)) return;
          context.report({
            node,
            message:
              'Surface styling belongs in recipes or layerStyle tokens; prefer layerStyle="panel".',
          });
        },
        Property(node) {
          const keyName = getPropertyName(node);
          if (!keyName || !SURFACE_PROPS.has(keyName)) return;
          if (isInsideTokenDefinition(context, node)) return;
          context.report({
            node,
            message:
              'Surface styling belongs in recipes or layerStyle tokens; prefer layerStyle="panel".',
          });
        },
      };
    },
  },

  "prefer-panda-css": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Prefer Panda css() helpers over raw className strings.",
      },
      schema: [],
    },
    create(context) {
      return {
        JSXAttribute(node) {
          const name = getAttrName(node);
          if (name !== "className") return;
          const elementName = node.parent?.name?.name;
          if (elementName === "body" || elementName === "html") return;
          const value = node.value;
          if (!value) return;

          if (value.type === "Literal") {
            if (typeof value.value === "string" && value.value.trim().length) {
              context.report({
                node,
                message: "Use Panda css() instead of raw className strings.",
              });
            }
            return;
          }

          if (value.type === "JSXExpressionContainer") {
            const expr = value.expression;
            if (expr.type === "Literal" || expr.type === "TemplateLiteral") {
              context.report({
                node,
                message: "Use Panda css() instead of raw className strings.",
              });
            }
          }
        },
      };
    },
  },

  "site-status-bar-shared-chrome": {
    meta: {
      type: "problem",
      docs: {
        description:
          "SiteStatusBar must use mode+row with the shared navbar layer; no variant fork.",
      },
      schema: [],
    },
    create(context) {
      return {
        JSXOpeningElement(node) {
          const elName = node.name;
          if (elName?.type !== "JSXIdentifier" || elName.name !== "SiteStatusBar") return;

          let hasVariant = false;
          let hasMode = false;
          let hasRow = false;
          for (const attr of node.attributes) {
            if (attr.type !== "JSXAttribute") continue;
            if (attr.name?.type !== "JSXIdentifier") continue;
            const n = attr.name.name;
            if (n === "variant") hasVariant = true;
            if (n === "mode") hasMode = true;
            if (n === "row") hasRow = true;
          }

          if (hasVariant) {
            context.report({
              node,
              message:
                "Remove variant on SiteStatusBar. Use mode and row so the bar uses the shared navbar layer (same chrome as the blog).",
            });
          }
          if (!hasMode || !hasRow) {
            context.report({
              node,
              message:
                'SiteStatusBar requires mode and row (e.g. mode="fixed" row="spaceBetween") to match blog/home status bar styling.',
            });
          }
        },
      };
    },
  },

  "navbar-chrome-layer-isolation": {
    meta: {
      type: "problem",
      docs: {
        description:
          'Only SiteStatusBar may use Panda layerStyle "navbar" for the shared status chrome.',
      },
      schema: [],
    },
    create(context) {
      return {
        Property(node) {
          if (isInsideTokenDefinition(context, node)) return;
          const keyName = getPropertyName(node);
          if (keyName !== "layerStyle") return;
          const text = getLiteralText(node.value);
          if (text !== "navbar") return;

          const filename = normalizeFileName(context.getFilename());
          if (filename.endsWith("SiteStatusBar.tsx")) return;

          context.report({
            node: node.key,
            message:
              'Only `app/components/shared/SiteStatusBar.tsx` may set `layerStyle: "navbar"`. Compose the shared `<SiteStatusBar mode=… row=…>` instead of duplicating navbar chrome.',
          });
        },
      };
    },
  },

  "prefer-pane-parent-duplicate-stack": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Pane column stacks must use PaneParent (or paneParent recipe), not duplicated css() objects.",
      },
      schema: [],
    },
    create(context) {
      return {
        ObjectExpression(node) {
          if (!isFirstArgOfCssOrCssRawCall(node)) return;
          if (!matchesDuplicatedPaneParentStack(node)) return;

          const filename = normalizeFileName(context.getFilename());
          if (filename.endsWith("PaneChild.tsx")) return;

          context.report({
            node,
            message:
              "Do not duplicate the pane stack layout in css(). Use <PaneParent> from app/components/shared or the `paneParent` recipe from styled-system/recipes.",
          });
        },
      };
    },
  },

  "admin-private-page-no-root-fragment": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Private admin pages must use AdminPageSections (PaneParent) instead of a root fragment so back links, sub-nav, and panels share gap \"6\".",
      },
      schema: [],
    },
    create(context) {
      let defaultExportFn = null;

      return {
        ExportDefaultDeclaration(node) {
          defaultExportFn = extractDefaultExportFunction(node.declaration);
        },
        ReturnStatement(node) {
          if (!isAdminPrivateAdminPageFile(context.getFilename())) return;
          if (node.argument?.type !== "JSXFragment") return;
          const enc = getEnclosingFunctionNode(node);
          if (!defaultExportFn || enc !== defaultExportFn) return;
          context.report({
            node: node.argument,
            message:
              'Wrap the page in <AdminPageSections> from @/app/components/admin/ui (PaneParent gap "layout" like blog shells). A root <> leaves siblings outside the shared stack.',
          });
        },
      };
    },
  },

  "admin-app-page-no-panda-styling": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Admin app/page.tsx files must be thin route modules: no Panda css() or styled-system/css imports — use @/app/components/admin/routes/* + @/app/components/admin/ui.",
      },
      schema: [],
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          if (!isAdminAppPageTsx(context.getFilename())) return;
          const src = node.source?.value;
          if (isPandaCssImportSource(src)) {
            context.report({
              node: node.source,
              message:
                "Do not import styled-system/css from an admin page.tsx. Move UI to app/components/admin/routes/ (or admin/ui) and re-export from page.tsx.",
            });
          }
          if (isDeprecatedDashboardShellImport(src)) {
            context.report({
              node: node.source,
              message:
                "Do not import from dashboard-shell. Use @/app/components/admin/ui (AdminPanel, AdminShell, …).",
            });
          }
        },
        CallExpression(node) {
          if (!isAdminAppPageTsx(context.getFilename())) return;
          if (isInsideTokenDefinition(context, node)) return;
          if (node.callee.type === "Identifier" && node.callee.name === "css") {
            context.report({
              node,
              message:
                "Admin page.tsx must not call css(). Move implementation to app/components/admin/routes/*.tsx.",
            });
          }
        },
      };
    },
  },

  /**
   * `/admin` overview is always one click away in **`AdminBrandBar`**. Duplicate breadcrumb rows
   * diverge from blog chrome parity and clutter the pane stack.
   */
  "admin-no-redundant-root-back-link": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Forbid AdminBackLink href=\"/admin\" (redundant with the fixed Overview nav pill).",
      },
      schema: [],
    },
    create(context) {
      return {
        JSXOpeningElement(node) {
          const elName = node.name;
          if (elName?.type !== "JSXIdentifier" || elName.name !== "AdminBackLink") {
            return;
          }
          for (const attr of node.attributes) {
            if (attr.type !== "JSXAttribute") continue;
            if (attr.name?.type !== "JSXIdentifier" || attr.name.name !== "href") {
              continue;
            }
            const value = attr.value;
            if (value?.type === "Literal" && value.value === "/admin") {
              context.report({
                node: attr,
                message:
                  "Remove this link. Use AdminBrandBar “Overview” for root navigation — do not add a duplicate “← Overview” breadcrumb inside the page.",
              });
            }
          }
        },
      };
    },
  },
};

export default { rules };
