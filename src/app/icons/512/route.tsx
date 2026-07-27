import { renderAppIcon } from "../render"

export async function GET() {
  return renderAppIcon(512)
}
