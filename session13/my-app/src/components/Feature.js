import { Container, Row, Col} from "react-bootstrap"

export default function Feature() {
  return (
    <Container className="p-3 rounded-3 my-2">
        <Row className="gap-3">
            <Col className="border border-dark border-2 text-center p-3 rounded-5 shadow bg-light">
                <h1 className="fw-bold">Free Shipping</h1>
                <p> we offer free shipping all across pampanga.</p>
            </Col>
            <Col className="border border-dark border-2 text-center p-3 rounded-5 shadow bg-light">
                <h1 className="fw-bold">50% Discount For Students.</h1>
                <p>50% Discount can be availed by student from secondary to college.</p>
            </Col>
            <Col className="border border-dark border-2 text-center p-3 rounded-5 shadow bg-light">
                <h1 className="fw-bold">Voucher Program</h1>
                <p>More Surprises through our official Voucher Program
                </p>
            </Col>
        </Row>
    </Container>
  )
}
