export class BusinessError extends Error {
  code: string
  message: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.message = message
  }
}
