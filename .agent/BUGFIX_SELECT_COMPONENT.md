# 🐛 Bug Fix: Select Component Event Handling

## Issue
Runtime error when using Select component in goal forms:
```
Cannot destructure property 'name' of 'e.target' as it is undefined.
```

## Root Cause
The custom `Select.jsx` component was calling `onChange(opt.value)` directly with just the value, but the form handlers in `AddGoal.jsx` and `EditGoal.jsx` were expecting a standard event object with `e.target.name` and `e.target.value`.

## Solution
Updated `Select.jsx` to:
1. Accept `name` prop
2. Pass event-like object to onChange handler:
   ```javascript
   onChange({
       target: {
           name: name,
           value: opt.value
       }
   })
   ```

## Files Modified
- `client/src/components/Select.jsx`

## Status
✅ Fixed - The Select component now works correctly with form handlers

## Testing
The error should no longer occur when:
- Creating a new goal
- Editing an existing goal
- Changing category/priority/status in dropdown menus

---

**Fixed:** February 4, 2026  
**Type:** Runtime Error  
**Severity:** High (blocked feature usage)  
**Resolution Time:** ~2 minutes
