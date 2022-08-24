use nalgebra_glm::{dot, vec3_to_vec4};

use crate::linalg::{vec3, vec4, BoundingBox, Mat4, Vec3};
use crate::shapes::shape::Shape;

pub struct Cylinder {
    center_a: Vec3,
    center_b: Vec3,
    radius: f64,
    object_id: u16,
    _middle: Vec3,
}

impl Cylinder {
    pub fn new(center_a: Vec3, center_b: Vec3, radius: f64, object_id: u16) -> Cylinder {
        Cylinder {
            center_a: center_a,
            center_b: center_b,
            radius: radius,
            object_id: object_id,
            _middle: (center_a + center_b) / 2.0,
        }
    }

    fn get_scaled_orthogonal_basis(&self) -> [Vec3; 3] {
        let axis_vec = self.center_a - self.center_b;
        let axis_option_0 = vec3(1.0, 0.0, 0.0);
        let axis_option_1 = vec3(0.0, 1.0, 0.0);

        let chosen_axis =
            if dot(&axis_option_0, &axis_vec).abs() < dot(&axis_option_1, &axis_vec).abs() {
                axis_option_0
            } else {
                axis_option_1
            };

        let perp_vector_0: Vec3 = chosen_axis.cross(&axis_vec).normalize() * 2.0 * self.radius;
        let perp_vector_1: Vec3 = perp_vector_0.cross(&axis_vec).normalize() * 2.0 * self.radius;

        [axis_vec, perp_vector_0, perp_vector_1]
    }
}

fn create_transform_from_axes(axis: &[Vec3; 3], middle: &Vec3) -> Mat4 {
    let mut matrix: Mat4 = Mat4::identity();
    matrix.set_column(0, &vec3_to_vec4(&axis[0]));
    matrix.set_column(1, &vec3_to_vec4(&axis[1]));
    matrix.set_column(2, &vec3_to_vec4(&axis[2]));
    matrix.set_column(3, &vec4(middle.x, middle.y, middle.z, 1.0));

    matrix
}

impl Shape for Cylinder {
    fn contains_point(&self, point: &Vec3) -> bool {
        let axis = (self.center_a - self.center_b).normalize();
        let half_height = (self.center_a - self.center_b).magnitude() / 2.0;

        let dist_along_axis = dot(&(point - self._middle), &axis);
        let dist_vector_along_axis = axis * dist_along_axis;
        let axis_relative_middle = point - dist_vector_along_axis;

        let dist_to_axis = (axis_relative_middle - self._middle).magnitude();

        dist_along_axis.abs() < half_height && dist_to_axis < self.radius
    }

    fn create_bounding_box(&self) -> BoundingBox {
        let axes = self.get_scaled_orthogonal_basis();
        let matrix = create_transform_from_axes(&axes, &self._middle);

        BoundingBox::get_transformed_unit_cube(&matrix)
    }

    fn get_object_id(&self) -> u16 {
        self.object_id
    }
}

#[cfg(test)]
mod tests {
    use wasm_bindgen_test::wasm_bindgen_test;

    use super::Cylinder;

    use crate::linalg::vec3;
    use crate::shapes::shape::Shape;

    #[wasm_bindgen_test]
    fn cylinder_at_origin_contains_middle_point() {
        let cylinder = Cylinder::new(vec3(0.0, -0.5, 0.0), vec3(0.0, 0.5, 0.0), 1.0, 0);

        assert!(cylinder.contains_point(&vec3(0.0, 0.0, 0.0)));
    }

    #[wasm_bindgen_test]
    fn thin_diagonal_cylinder_contains_point_in_middle() {
        let center_a = vec3(213.0, -33.0, 983.12);
        let center_b = vec3(-12.0, 234.0, -10.0);

        let middle = (center_a + center_b) / 2.0;
        let outside_middle = middle + vec3(0.1, 0.1, 0.1);

        let cylinder = Cylinder::new(center_a, center_b, 1e-2, 0);

        assert!(cylinder.contains_point(&middle));
        assert!(!cylinder.contains_point(&outside_middle));
    }

    #[wasm_bindgen_test]
    fn cylinder_bounding_box_contains_centers_but_not_more_along_axis() {
        let center_a = vec3(21.0, -33.0, 98.0);
        let center_b = vec3(-12.0, 23.0, -10.0);

        let axis = (center_a - center_b).normalize();

        let cylinder = Cylinder::new(center_a, center_b, 1e-2, 0);
        let bounding_box = cylinder.create_bounding_box();

        assert!(bounding_box.contains_point(&center_a));
        assert!(bounding_box.contains_point(&center_b));
        assert!(!bounding_box.contains_point(&(center_a + axis)));
    }
}
