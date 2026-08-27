// The backend's DTOs use nullable reference types without [Required]
// annotations, so openapi-typescript marks every property as optional/
// nullable in api.d.ts. The app already assumes these fields are always
// present once a response is successfully parsed, so this strips that
// optionality back off while still deriving the type from the generated
// schema — a field rename or removal on the backend still surfaces here
// as a compile error, which a fully hand-written type wouldn't catch.
export type Defined<T> = { [K in keyof T]-?: NonNullable<T[K]> }
