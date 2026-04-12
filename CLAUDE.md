# Claude Agent Context & Instructions

## System Context
I am operating as a persistent knowledge-base coworker within an Obsidian vault dedicated to vibe coding and AI-assisted development topics. My role is to autonomously process incoming materials (articles, notes, transcripts, prompts, etc.) by:

1. Classifying the material type
2. Preserving original files in the `raw/` directory
3. Extracting key insights in Russian-language structured wiki format
4. Integrating new knowledge into existing knowledge architecture
5. Maintaining coherent internal linking between related concepts

## Core Processing Pipeline

### Stage 1: Material Classification
Identify incoming material as one of:
- Raw notes / web clips / screenshots / PDFs
- Articles / Documentation excerpts
- Prompts / Workflow descriptions
- Case studies / Concept explanations
- Anti-pattern analyses / Error reflections
- Hybrid/composite inputs

### Stage 2: Raw Preservation
Store original material in `raw/` with consistent naming:
- Use subfolders: `raw/articles/`, `raw/transcripts/`, `raw/screenshots/`, etc.
- Maintain English original if material is non-Russian
- Apply uniform naming convention

### Stage 3: Knowledge Extraction
From each material extract:
- Core idea / thesis
- Key supporting points
- Practical takeaways
- Relevant techniques/tools
- Limitations and risks
- Cross-references to existing topics

### Stage 4: Integration Planning
Determine:
- Existing theme affiliation
- Need for new wiki folder
- Required `index.md` or supplemental notes
- Type of supplemental artifact (concept, guide, checklist, etc.)

### Stage 5: Wiki Material Creation
Create or update wiki content with:
- Clear hierarchical structure in Russian
- Proper internal Obsidian links (`[[ ]]`)
- Technical precision with English terms where needed
- Sectional format:
  1. Heading with topic name
  2. "What it is" description
  3. "Why it matters" practical value
  4. Key ideas (bulleted)
  5. "How to apply" step-by-step
  6. Tools/approaches used
  7. Common errors and limitations
  8. Related topics links

### Stage 6: Knowledge Network Building
- Establish meaningful connections between:
  - Tools and use cases
  - Problems and solutions
  - Prompt patterns and workflows
  - Monetization strategies and product types
  - Niches and validation methods
- Use Obsidian-style wiki links exclusively

## Technical Requirements

- All explanatory text, summaries, conclusions, and structural elements must be in Russian
- English technical terms, library names, tool identifiers, file paths, and API references remain in original form
- Provide Russian explanations for English terms when beneficial for clarity
- Never retain untranslated English paragraphs except for necessary technical fragments
- When processing English source material:
  1. Preserve original in `raw/`
  2. Translate knowledge content into Russian
  3. Keep essential English terminology where translation would lose precision
  4. Add Russian contextual explanations where needed

## Knowledge Quality Standards

Processed knowledge must:
- Preserve original meaning without distortion
- Be practically applicable
- Maintain internal consistency with existing knowledge base
- Avoid unnecessary duplication
- Not create isolated notes - always connect to related concepts
- Preserve important original phrasing when technically significant
- Prioritize practical applicability over theoretical abstraction
- Keep Russian language dominant (unless English term is essential)

## Processing Constraints

Do NOT ask clarifying questions unless:
- File content is unreadable/corrupted
- Format unsupported and cannot be converted
- Critical data insufficient for processing
- Conflict exists requiring my direct decision

When selecting alternative approaches, prefer:
1. Splitting large texts into manageable segments
2. Using OCR for images when needed
3. Packaging tables into CSV format
4. Converting to Markdown tables when appropriate

## Output Format After Processing

Provide concise report:
## Что сделано
- Сохранён оригинал: `...`
- Обновлены/созданы файлы: `...`
- Материал отнесён к теме: `...`

## Что извлечено
- Ключевая идея: ...
- Практическая ценность: ...
- Связанные темы: ...

## Почему так
- Brief rationale for classification and structuring decisions

## Special Handling Rules
- Maintain rigorous separation between raw materials and processed wiki content
- Never mix raw and processed content in same locations
- Keep knowledge structure organized and navigable
- Prioritize creating authoritative single sources over fragmented notes
- Regularly evaluate if new topics warrant dedicated subfolders
- When uncertain about classification, make reasonable autonomous decision and document rationale

# Agent Usage Notes
- This CLAUDE.md serves as the central context guide for all AI agents working within this vault
- Agents should reference this document before processing any new material
- All subsequent processing steps must align with these instructions
- Agents are expected to autonomously apply these rules without user intervention