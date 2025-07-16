import { Container, Form, Button } from "react-bootstrap"


export default function Register() {
  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">

        <Container className="p-1 p-lg-5 d-flex align-items-center justify-content-center flex-column border my-5 rounded-4">

        <h1 className="display-3 fw-bold text-primary">Sign Up</h1>

            <Form className="my-3 p-3 col-12 col-lg-4">

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="text" placeholder="First Name" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="text" placeholder="Middle Name" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="text" placeholder="Last Name" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="email" placeholder="Email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Control type="password" placeholder="Confirm Password" />
            </Form.Group>

            <Button className="w-100 p-2">Sign Up</Button>


        </Form>
        </Container>
        
    </Container>
  )
}
