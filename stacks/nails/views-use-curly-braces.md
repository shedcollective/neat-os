---
name: nails-views-use-curly-braces
description: In Nails PHP views, use curly-brace control structures. Do not use colon/endif syntax.
---

# nails-views-use-curly-braces

In PHP view files, control structures use curly braces. Do not use the alternative colon syntax (`if (...):` / `endif`, `foreach (...):` / `endforeach`, and the same for `for`, `while`, and `switch`).

Both forms are valid PHP. Nails views mix PHP with markup using braces, so colon/endif is a style split agents otherwise reintroduce.

## When to use

Writing or editing a PHP view in a Nails application.

## Steps

1. Match the nearest existing view in the same tree.
2. Use curly braces for `if`, `foreach`, `for`, `while`, and `switch`.
3. Do not write `endif`, `endforeach`, `endfor`, `endwhile`, or `endswitch`.

Prefer:

```php
<?php if (!empty($item)) { ?>
    <p><?= htmlspecialchars($item->label) ?></p>
<?php } ?>
```

Not:

```php
<?php if (!empty($item)): ?>
    <p><?= htmlspecialchars($item->label) ?></p>
<?php endif; ?>
```

## Stop

If a neighbouring view already uses colon/endif, still use braces for new or edited control structures in this change. Do not restyle the whole file unless the ticket is a view-style pass.

**Source.** Recorded in the archive repository.
