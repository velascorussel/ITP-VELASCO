import { Container } from "react-bootstrap"
import Items from "../components/Items"

export default function Product() {
  return (
    <Container fluid className="p-4">
        <h1 className="display-3 text-center fw-bold">Products Page</h1>
        <Items/>
    </Container>
  )
}
