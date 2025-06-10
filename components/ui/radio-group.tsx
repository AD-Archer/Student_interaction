/**
 * radio-group.tsx
 * Simple radio group and radio item components for consistent radio button UI.
 * Used for mutually exclusive selection in forms (e.g., follow-up recipient).
 *
 * Usage:
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="student" label="Student" />
 *   <RadioGroupItem value="staff" label="Staff" />
 * </RadioGroup>
 */

import React from "react"

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactElement<RadioGroupItemProps> | React.ReactElement<RadioGroupItemProps>[]
  className?: string
}

// I want to ensure children are RadioGroupItem elements so I can safely pass checked/onChange
export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement<RadioGroupItemProps>(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value)
          })
        }
        return child
      })}
    </div>
  )
}

interface RadioGroupItemProps {
  value: string
  label: React.ReactNode // allow icons and rich content
  checked?: boolean
  onChange?: () => void
  id?: string
}

export function RadioGroupItem({ value, label, checked, onChange, id }: RadioGroupItemProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" htmlFor={id || value}>
      <input
        type="radio"
        id={id || value}
        name="radio-group"
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-blue-600 h-4 w-4"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
