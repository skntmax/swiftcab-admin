
import React from 'react'
import {FormInput} from '@/components/FormController/index'
import { useForm } from 'react-hook-form';
function TestForm() {
     // form 
    const { control, handleSubmit , register , watch , erorr, formState , getValues , setValue  } = useForm({
    defaultValues: {
        firstName: '',
        ['save-next']: {}
    },
    // resolver: yupResolver(schema)
    });

    const onSubmit = ()=>{
        console.log(getValues())
    }
    return (
    <><form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
        name="firstName"
        type="text"
        control={control}
        register={register}
        rest={{  
            id:"standard-helperText",
            label:"First name",
            defaultValue:"first name please",
            helperText:"",
            variant:"standard", }}
        />
      
      <FormInput
      name="save-next"
      type="button"
      register={register}
      control={control}
      rest={{ variant:"contained"}}
      >
        submit 
      </FormInput>
      <FormInput
      name="pdf-upload"
      type="upload"
      register={register}
      control={control}
      >
        Upload 
      </FormInput>

    </form>
    </>
  )
}

export default TestForm