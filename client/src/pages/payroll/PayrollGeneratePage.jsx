import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import PageWrapper from "../../components/ui/PageWrapper";
import { fetchEmployees } from "../../services/employees";
import { generatePayroll } from "../../services/payroll";

export default function PayrollGeneratePage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: 0,
    otherDeductions: 0,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const result = await fetchEmployees({
        limit: 100,
      });

      console.log("Employees:", result);

      setEmployees(result.data || []);
    } catch (err) {
      toast({
        title: "Unable to load employees",
        description: err.message,
        status: "error",
      });
    }
  }

  async function handleSubmit() {
    if (!form.employeeId) {
      toast({
        title: "Select Employee",
        status: "warning",
      });
      return;
    }
try {
  setLoading(true);

  console.log("Submitting Payroll:", form);

  const result = await generatePayroll(form.employeeId, {
    month: Number(form.month),
    year: Number(form.year),
    bonus: Number(form.bonus),
    otherDeductions: Number(form.otherDeductions),
  });

  console.log("Payroll Response:", result);

  toast({
    title: "Payroll Generated Successfully",
    status: "success",
  });

  navigate("/payroll/payroll");
}
catch (err) {
  console.log("Payroll Error:", err.response);
  console.log("Payroll Error Data:", err.response?.data);

  toast({
    title: "Generation Failed",
    description: err.response?.data?.message || err.message,
    status: "error",
  });
} finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <Box maxW="650px">

        <Heading size="lg" mb={6}>
          Generate Payroll
        </Heading>

        <Stack spacing={5}>

          <FormControl isRequired>
            <FormLabel>Employee</FormLabel>

            <Select
              placeholder="Select Employee"
              value={form.employeeId}
              onChange={(e) =>
                setForm({
                  ...form,
                  employeeId: e.target.value,
                })
              }
            >
              {employees.map((emp) => (
                <option
                  key={emp._id}
                  value={emp._id}
                >
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Month</FormLabel>

            <Select
              value={form.month}
              onChange={(e) =>
                setForm({
                  ...form,
                  month: e.target.value,
                })
              }
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2025, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Year</FormLabel>

            <Input
              type="number"
              value={form.year}
              onChange={(e) =>
                setForm({
                  ...form,
                  year: e.target.value,
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bonus</FormLabel>

            <Input
              type="number"
              value={form.bonus}
              onChange={(e) =>
                setForm({
                  ...form,
                  bonus: e.target.value,
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Other Deductions</FormLabel>

            <Input
              type="number"
              value={form.otherDeductions}
              onChange={(e) =>
                setForm({
                  ...form,
                  otherDeductions: e.target.value,
                })
              }
            />
          </FormControl>

          <Button
            colorScheme="purple"
            isLoading={loading}
            onClick={handleSubmit}
          >
            Generate Payroll
          </Button>

        </Stack>
      </Box>
    </PageWrapper>
  );
}