# Excalidraw Templates

Visual diagram templates for Jeet's teaching content.

---

## Overview

Templates are parametric Excalidraw diagrams. The LLM fills in specific values, and the frontend renders them.

```
Template (base structure)
    +
Parameters (specific values)
    =
Rendered Diagram
```

---

## Template Categories

| Category | Use Case | Count |
|----------|----------|-------|
| `flow` | Chain processes (A→B→C) | ~15 |
| `geometry` | Triangles, circles, shapes | ~40 |
| `graph` | Bar, pie, line charts | ~20 |
| `number-line` | Number representations | ~10 |
| `table` | Tabular data display | ~10 |
| `comparison` | Side-by-side comparisons | ~10 |
| `venn` | Set diagrams | ~5 |

---

## Template Structure

```json
{
  "id": "template-id",
  "name": "Human readable name",
  "category": "flow|geometry|graph|...",
  "description": "When to use this template",

  "params": [
    {
      "name": "param_name",
      "type": "text|number|color",
      "position": "where in diagram",
      "default": "default value"
    }
  ],

  "base_elements": [
    // Excalidraw elements array
  ],

  "preview_url": "/templates/previews/template-id.png"
}
```

---

## Directory Structure

```
templates/
├── excalidraw/           # Template JSON files
│   ├── flow-chain-2.json
│   ├── flow-chain-3.json
│   ├── triangle-basic.json
│   ├── triangle-right.json
│   └── ...
│
└── previews/             # PNG previews for documentation
    ├── flow-chain-2.png
    ├── flow-chain-3.png
    └── ...
```

---

## Usage

### In Pattern Definition

```json
{
  "visual": {
    "has_diagram": true,
    "template_id": "flow-chain-3",
    "when_to_show": "always"
  }
}
```

### LLM Output

```json
{
  "template_id": "flow-chain-3",
  "params": {
    "entity_1": "A",
    "entity_2": "B",
    "entity_3": "C",
    "arrow_1_label": "20% profit",
    "arrow_2_label": "25% profit",
    "value_1": "CP = ?",
    "value_3": "₹600"
  }
}
```

### Frontend Rendering

```javascript
import { Excalidraw } from '@excalidraw/excalidraw';

function renderTemplate(template, params) {
  const elements = applyParams(template.base_elements, params);
  return <Excalidraw initialData={{ elements }} />;
}
```

---

## Creating New Templates

1. **Design in Excalidraw**
   - Open excalidraw.com
   - Create the base diagram
   - Export as JSON

2. **Identify Parameters**
   - What text/values will change?
   - Mark their element IDs

3. **Create Template File**
   - Add to `excalidraw/` folder
   - Define params array
   - Add preview image

4. **Test**
   - Render with sample params
   - Verify positioning

---

## Excalidraw Element Basics

```json
{
  "type": "rectangle",
  "id": "unique-id",
  "x": 100,
  "y": 100,
  "width": 80,
  "height": 50,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "roughness": 1,
  "strokeWidth": 1
}
```

Common types:
- `rectangle` - boxes
- `ellipse` - circles, ovals
- `arrow` - connecting arrows
- `line` - simple lines
- `text` - labels
- `diamond` - decision nodes

---

## Style Guide

- **Roughness**: 1 (hand-drawn feel)
- **Stroke color**: `#1e1e1e` (dark)
- **Fill colors**: Pastel palette
  - Blue: `#a5d8ff`
  - Green: `#b2f2bb`
  - Yellow: `#ffec99`
  - Red: `#ffc9c9`
- **Font**: Default (hand-drawn)
- **Keep it simple**: Minimal elements, clear labels
